import { Schema, Slice, Fragment, ResolvedPos, ProsemirrorNode } from 'prosemirror-model';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

import {
  RowInfo,
  SelectionInfo,
  getResolvedSelection,
  getSelectionInfo,
  getTableCellsInfo,
  createDummyCells,
  createTableBodyRows,
  getTableContentFromSlice,
} from '@/wysiwyg/helper/table';

import {
  createRowsFromPastingTable,
  copyTableHeadRow,
  copyTableBodyRow,
} from '@/wysiwyg/clipboard/paste';

interface TargetTableInfo {
  cellsInfo: RowInfo[];
  tableRowCount: number;
  tableColumnCount: number;
}

interface PastingRangeInfo {
  addedRowCount: number;
  addedColumnCount: number;
  startRowIdx: number;
  startColIdx: number;
  endColIdx: number;
  endRowIdx: number;
}

interface ReplacedCellsOffsets {
  startCellOffset: number;
  endCellOffset: number;
  nextCellOffset: number;
  rowIdx: number;
  startColIdx: number;
  endColIdx: number;
  extendedStart?: boolean;
  extendedEnd?: boolean;
}

const DUMMY_CELL_SIZE = 4;
const TR_NODES_SIZE = 2;

function getDummyCellSize(dummyCellCount: number) {
  return dummyCellCount * DUMMY_CELL_SIZE;
}

function createPastingCells(
  tableContent: Fragment,
  curSelectionInfo: SelectionInfo,
  schema: Schema
) {
  const pastingRows: Fragment[] = [];
  const pastingTableRows = createRowsFromPastingTable(tableContent);
  const columnCount = pastingTableRows[0].childCount;
  const rowCount = pastingTableRows.length;

  const startToTableHead = curSelectionInfo.startRowIdx === 0;
  const slicedRows = pastingTableRows.slice(0, rowCount);

  if (startToTableHead) {
    const tableHeadRow = slicedRows.shift();

    if (tableHeadRow) {
      const { content } = copyTableHeadRow(tableHeadRow, columnCount, schema);

      pastingRows.push(content);
    }
  }

  slicedRows.forEach((tableBodyRow) => {
    if (!tableBodyRow.attrs.dummyRowForPasting) {
      const { content } = copyTableBodyRow(tableBodyRow, columnCount, schema);

      pastingRows.push(content);
    }
  });

  return pastingRows;
}

function getTargetTableInfo(anchor: ResolvedPos) {
  const cellsInfo = getTableCellsInfo(anchor);

  return {
    cellsInfo,
    tableRowCount: cellsInfo.length,
    tableColumnCount: cellsInfo[0].length,
  };
}

function getPastingRangeInfo(
  { tableRowCount, tableColumnCount }: TargetTableInfo,
  { startRowIdx, startColIdx }: SelectionInfo,
  pastingCells: Fragment[]
) {
  const pastingRowCount = pastingCells.length;
  let pastingColumnCount = 0;

  for (let i = 0; i < pastingRowCount; i += 1) {
    let columnCount = pastingCells[i].childCount;

    pastingCells[i].forEach(({ attrs }) => {
      const { colspan } = attrs;

      if (colspan > 1) {
        columnCount += colspan - 1;
      }
    });
    pastingColumnCount = Math.max(pastingColumnCount, columnCount);
  }

  const endRowIdx = startRowIdx + pastingRowCount - 1;
  const endColIdx = startColIdx + pastingColumnCount - 1;
  const addedRowCount = Math.max(endRowIdx + 1 - tableRowCount, 0);
  const addedColumnCount = Math.max(endColIdx + 1 - tableColumnCount, 0);

  return {
    startRowIdx,
    startColIdx,
    endRowIdx,
    endColIdx,
    addedRowCount,
    addedColumnCount,
  };
}

function addReplacedOffsets(
  { tableColumnCount, cellsInfo }: TargetTableInfo,
  {
    startRowIdx,
    startColIdx,
    endRowIdx,
    endColIdx,
    addedRowCount,
    addedColumnCount,
  }: PastingRangeInfo,
  cellsOffsets: ReplacedCellsOffsets[]
) {
  for (let rowIdx = startRowIdx; rowIdx <= endRowIdx - addedRowCount; rowIdx += 1) {
    const start = cellsInfo[rowIdx][startColIdx];
    const end = cellsInfo[rowIdx][endColIdx - addedColumnCount];
    const rowEnd = cellsInfo[rowIdx][tableColumnCount - 1];

    cellsOffsets.push({
      rowIdx,
      startColIdx,
      endColIdx: endColIdx - addedColumnCount,
      startCellOffset: start.offset,
      endCellOffset: end.offset + end.nodeSize,
      nextCellOffset: rowEnd.offset + rowEnd.nodeSize + TR_NODES_SIZE,
      extendedStart: start.extended,
      extendedEnd: end.extended,
    });
  }
}

function expandColumns(
  tr: Transform,
  schema: Schema,
  { tableRowCount, cellsInfo }: TargetTableInfo,
  {
    startRowIdx,
    startColIdx,
    endRowIdx,
    endColIdx,
    addedRowCount,
    addedColumnCount,
  }: PastingRangeInfo,
  cellsOffsets: ReplacedCellsOffsets[]
) {
  let index = 0;

  for (let rowIdx = 0; rowIdx < tableRowCount; rowIdx += 1) {
    const { offset, nodeSize } = cellsInfo[rowIdx][endColIdx - addedColumnCount];
    const insertOffset = tr.mapping.map(offset + nodeSize);
    const cells = createDummyCells(addedColumnCount, rowIdx, schema);

    tr.insert(insertOffset, cells);

    if (rowIdx >= startRowIdx && rowIdx <= endRowIdx - addedRowCount) {
      const startCellOffset = tr.mapping.map(cellsInfo[rowIdx][startColIdx].offset);
      const endCellOffset = insertOffset + getDummyCellSize(addedColumnCount);
      const nextCellOffset = endCellOffset + TR_NODES_SIZE;

      cellsOffsets[index] = {
        rowIdx,
        startCellOffset,
        endCellOffset,
        nextCellOffset,
        startColIdx,
        endColIdx,
      };
      index += 1;
    }
  }
}

function expandRows(
  tr: Transform,
  schema: Schema,
  { tableColumnCount, cellsInfo }: TargetTableInfo,
  { addedRowCount, addedColumnCount, startColIdx, endColIdx }: PastingRangeInfo,
  cellsOffsets: ReplacedCellsOffsets[]
) {
  const endCell = cellsOffsets[cellsOffsets.length - 1];
  const resolvedPos = tr.doc.resolve(endCell.startCellOffset);
  const table = resolvedPos.node(resolvedPos.depth - 2);
  const tableEnd = resolvedPos.before(resolvedPos.depth - 2) + table.nodeSize - 2;

  const rows = createTableBodyRows(addedRowCount, tableColumnCount + addedColumnCount, schema);
  let startOffset = tableEnd;

  tr.insert(tr.mapping.slice(tr.mapping.maps.length).map(startOffset), rows);

  for (let rowIndex = 0; rowIndex < addedRowCount; rowIndex += 1) {
    const startCellOffset = startOffset + 1 + getDummyCellSize(startColIdx);
    const endCellOffset = startOffset + 1 + getDummyCellSize(endColIdx + 1);
    const nextCellOffset =
      startOffset + getDummyCellSize(tableColumnCount + addedColumnCount) + TR_NODES_SIZE;

    cellsOffsets.push({
      rowIdx: rowIndex + cellsInfo[0].length + 1,
      startColIdx,
      endColIdx,
      startCellOffset,
      endCellOffset,
      nextCellOffset,
    });
    startOffset = nextCellOffset;
  }
}

function positionAt(
  headOrBody: ProsemirrorNode,
  cellsInfo: RowInfo[],
  tableStart: number,
  rowIdx: number,
  colIdx: number
) {
  const columnCount = cellsInfo[0].length;

  for (let i = 0, rowStart = tableStart; ; i += 1) {
    const rowEnd = rowStart + headOrBody.child(i).nodeSize;

    if (i + 1 === rowIdx) {
      let index = colIdx;

      // Skip past cells from previous rows (via rowspan)
      while (index < columnCount && cellsInfo[i + 1][index].offset < rowStart) index += 1;

      return index === columnCount ? rowEnd - 1 : cellsInfo[i + 1][index].offset;
    }
    rowStart = rowEnd;
  }
}

function replaceCells(
  tr: Transform,
  pastingRows: Fragment[],
  cellsOffsets: ReplacedCellsOffsets[],
  cellsInfo: RowInfo[]
) {
  const mapFrom = tr.mapping.maps.length;

  let tableStart = 0;
  let headOrBody: ProsemirrorNode;

  cellsOffsets.forEach((offsets, index) => {
    const { extendedStart, extendedEnd, rowIdx, startColIdx, endColIdx } = offsets;
    const mapping = tr.mapping.slice(mapFrom);
    const startCellOffset = mapping.map(offsets.startCellOffset);
    const endCellOffset = mapping.map(offsets.endCellOffset);
    const cells = new Slice(pastingRows[index], 0, 0);

    if (!headOrBody) {
      const resolvedPos = tr.doc.resolve(startCellOffset);

      headOrBody = resolvedPos.node(resolvedPos.depth - 1);
      tableStart = resolvedPos.before(resolvedPos.depth - 1);
    }

    const from = extendedStart
      ? mapping.map(positionAt(headOrBody, cellsInfo, tableStart, rowIdx, startColIdx))
      : startCellOffset;
    const to = extendedEnd
      ? mapping.map(positionAt(headOrBody, cellsInfo, tableStart, rowIdx, endColIdx))
      : endCellOffset;

    tr.replace(from, to, cells);
  });
}

export function pasteToTable(view: EditorView, slice: Slice) {
  const { selection, schema, tr } = view.state;
  const { anchor, head } = getResolvedSelection(selection);

  if (anchor && head) {
    const tableContent = getTableContentFromSlice(slice);

    if (!tableContent) {
      return false;
    }

    const targetTableInfo = getTargetTableInfo(anchor);
    const { cellsInfo } = targetTableInfo;
    const curSelectionInfo = getSelectionInfo(cellsInfo, anchor, head);

    const pastingCells = createPastingCells(tableContent, curSelectionInfo, schema);
    const pastingInfo = getPastingRangeInfo(targetTableInfo, curSelectionInfo, pastingCells);

    const cellsOffsets: ReplacedCellsOffsets[] = [];

    addReplacedOffsets(targetTableInfo, pastingInfo, cellsOffsets);

    if (pastingInfo.addedColumnCount) {
      expandColumns(tr, schema, targetTableInfo, pastingInfo, cellsOffsets);
    }

    if (pastingInfo.addedRowCount) {
      expandRows(tr, schema, targetTableInfo, pastingInfo, cellsOffsets);
    }
    replaceCells(tr, pastingCells, cellsOffsets, cellsInfo);

    view.dispatch!(tr);

    return true;
  }

  return false;
}

// function extend() {
//   const ranges = [
//     pastingInfo.startRowIdx,
//     pastingInfo.startColIdx,
//     pastingInfo.endRowIdx,
//     pastingInfo.endColIdx,
//   ];

//   if (cellsInfo.length > pastingInfo.endRowIdx) {
//     const extendedRange = getExtendedRanges(ranges, cellsInfo);
//     const rowCount = extendedRange.endRowIdx - extendedRange.startRowIdx + 1;
//     const colCount = extendedRange.endColIdx - extendedRange.startColIdx + 1;

//     if (rowCount > pastingCells.length) {
//       const len = pastingCells.length;

//       for (let i = 0; i < rowCount - len; i += 1) {
//         const rows = createTableBodyRows(1, 1, schema);

//         pastingCells.push(Fragment.from(rows[0].content));
//       }
//     }

//     // 요기 다 정리하고 여기 어디서 스팬 빼주기
//     for (let i = 0; i < rowCount; i += 1) {
//       let totalColCnt = pastingCells[i].childCount;

//       if (totalColCnt > 0) {
//         pastingCells[i].forEach((n) => {
//           if (n.attrs.colspan) {
//             totalColCnt += n.attrs.colspan - 1;
//           }
//         });
//         if (colCount > totalColCnt) {
//           const cells = createDummyCells(
//             colCount - pastingCells[i].childCount,
//             pastingInfo.startRowIdx + i,
//             schema
//           );

//           pastingCells[i] = pastingCells[i].append(Fragment.from(cells));
//         }
//       }
//     }

//     if (pastingInfo.endRowIdx - pastingInfo.startRowIdx + 1 < rowCount) {
//       pastingInfo.endRowIdx += rowCount - (pastingInfo.endRowIdx - pastingInfo.startRowIdx + 1);
//     }

//     if (pastingInfo.endColIdx - pastingInfo.startColIdx + 1 < colCount) {
//       pastingInfo.endColIdx += colCount - (pastingInfo.endColIdx - pastingInfo.startColIdx + 1);
//     }
//   }
// }
