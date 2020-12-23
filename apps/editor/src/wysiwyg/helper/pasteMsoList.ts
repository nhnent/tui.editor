import {
  isElemNode,
  findNodes,
  removeNode,
  unwrapNode,
  insertBeforeNode,
  appendNodes
} from '@/utils/dom';

const MSO_CLASS_NAME_LIST_PARA = 'p.MsoListParagraph';
const MSO_CLASS_NAME_LIST_RX = /MsoListParagraph/;
const MSO_STYLE_PREFIX_RX = /style=(.|\n)*mso-/;
const MSO_STYLE_LIST_RX = /mso-list:(.*)/;
const MSO_TAG_NAME_RX = /O:P/;
const UNORDERED_LIST_BULLET_RX = /^(n|u|l)/;

interface ListItemData {
  id: number;
  level: number;
  prev: ListItemData | null;
  parent: ListItemData | null;
  children: ListItemData[];
  unorderedListItem: boolean;
  contents: string;
}

export function isFromMso(html: string) {
  return MSO_STYLE_PREFIX_RX.test(html);
}

function getListItemContents(para: HTMLElement) {
  const removedNodes = [];
  const walker = document.createTreeWalker(para, 1, null, false);

  while (walker.nextNode()) {
    const node = walker.currentNode;

    if (isElemNode(node)) {
      const { outerHTML, textContent } = node as HTMLElement;
      const msoSpan = MSO_STYLE_PREFIX_RX.test(outerHTML);
      const bulletSpan = MSO_STYLE_LIST_RX.test(outerHTML);

      if (msoSpan && !bulletSpan && textContent) {
        removedNodes.push([node, true]);
      } else if (MSO_TAG_NAME_RX.test(node.nodeName) || (msoSpan && !textContent) || bulletSpan) {
        removedNodes.push([node, false]);
      }
    }
  }

  removedNodes.forEach(([node, isUnwrap]) => {
    if (isUnwrap) {
      unwrapNode(node as HTMLElement);
    } else {
      removeNode(node as HTMLElement);
    }
  });

  return para.innerHTML.trim();
}

function createListItemDataFromParagraph(para: HTMLElement, index: number) {
  const styleAttr = para.getAttribute('style');

  if (styleAttr) {
    const [, listItemInfo] = styleAttr.match(MSO_STYLE_LIST_RX)!;
    const [, levelStr] = listItemInfo.trim().split(' ');
    const level = parseInt(levelStr.replace('level', ''), 10);
    const unorderedListItem = UNORDERED_LIST_BULLET_RX.test(para.textContent || '');

    return {
      id: index,
      level,
      prev: null,
      parent: null,
      children: [],
      unorderedListItem,
      contents: getListItemContents(para)
    };
  }

  return null;
}

function addListItemDetailData(data: ListItemData, prevData: ListItemData) {
  if (prevData.level < data.level) {
    prevData.children.push(data);
    data.parent = prevData;
  } else {
    while (prevData) {
      if (prevData.level === data.level) {
        break;
      }
      prevData = prevData.parent!;
    }

    if (prevData) {
      data.prev = prevData;
      data.parent = prevData.parent;

      if (data.parent) {
        data.parent.children.push(data);
      }
    }
  }
}

function createListData(paras: HTMLElement[]) {
  const listData: ListItemData[] = [];

  paras.forEach((para, index) => {
    const prevListItemData = listData[index - 1];
    const listItemData = createListItemDataFromParagraph(para, index);

    if (!listItemData) {
      return;
    }

    if (prevListItemData) {
      addListItemDetailData(listItemData, prevListItemData);
    }

    listData.push(listItemData);
  });

  return listData;
}

function makeList(listData: ListItemData[]) {
  const listTagName = listData[0].unorderedListItem ? 'ul' : 'ol';
  const list = document.createElement(listTagName);

  listData.forEach(data => {
    const { children, contents } = data;
    const listItem = document.createElement('li');

    listItem.innerHTML = contents;
    list.appendChild(listItem);

    if (children.length) {
      list.appendChild(makeList(children));
    }
  });

  return list;
}

function makeListFromParagraphs(paras: HTMLElement[]) {
  const listData = createListData(paras);
  const rootChildren = listData.filter(({ parent }) => !parent);

  return makeList(rootChildren);
}

function isMsoListParagraphEnd(node: HTMLElement) {
  while (node) {
    if (isElemNode(node)) {
      break;
    }
    node = node.nextSibling as HTMLElement;
  }

  return node ? !MSO_CLASS_NAME_LIST_RX.test(node.className) : true;
}

export function convertMsoParagraphsToList(html: string) {
  const container = document.createElement('div') as HTMLElement;

  container.innerHTML = html;

  let paras: HTMLElement[] = [];

  const foundParas = findNodes(container, MSO_CLASS_NAME_LIST_PARA);

  foundParas.forEach(para => {
    const msoListParaEnd = isMsoListParagraphEnd(para.nextSibling as HTMLElement);

    paras.push(para as HTMLElement);

    if (msoListParaEnd) {
      const list = makeListFromParagraphs(paras);
      const { nextSibling } = para;

      if (nextSibling) {
        insertBeforeNode(list, nextSibling);
      } else {
        appendNodes(container, list);
      }

      paras = [];
    }

    removeNode(para);
  });

  const extraHTML = foundParas.length ? '<p></p>' : '';

  return `${extraHTML}${container.innerHTML}`;
}