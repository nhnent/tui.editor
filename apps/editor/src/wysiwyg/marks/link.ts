import { Mark as ProsemirrorMark, DOMOutputSpecArray } from 'prosemirror-model';
import { toggleMark } from 'prosemirror-commands';

import Mark from '@/spec/mark';
import { decodeURIGraceful, replaceMarkdownText } from '@/utils/encoder';
import { sanitizeXssAttributeValue } from '@/sanitizer/htmlSanitizer';
import { createText } from '@/helper/manipulation';

import { EditorCommand } from '@t/spec';

export class Link extends Mark {
  get name() {
    return 'link';
  }

  get defaultSchema() {
    return {
      attrs: {
        linkUrl: { default: '' },
        linkText: { default: false },
        htmlToken: { default: false }
      },
      inclusive: false,
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs(dom: Node | string) {
            return {
              linkUrl: (dom as HTMLElement).getAttribute('href'),
              linkText: (dom as HTMLElement).textContent
            };
          }
        }
      ],
      toDOM({ attrs }: ProsemirrorMark): DOMOutputSpecArray {
        return [
          'a',
          {
            href: sanitizeXssAttributeValue(attrs.linkUrl)
          }
        ];
      }
    };
  }

  private addLink(): EditorCommand {
    return payload => (state, dispatch) => {
      const { linkUrl, linkText } = payload!;
      const { schema, tr, selection } = state;
      const { empty, from, to } = selection;

      if (!linkUrl || !linkText) {
        return false;
      }

      if (empty) {
        const attrs = {
          linkUrl: replaceMarkdownText(decodeURIGraceful(linkUrl), true),
          linkText: replaceMarkdownText(linkText, false)
        };
        const marks = [schema.mark('link', attrs)];
        const node = createText(schema, linkText, marks, false);

        tr.replaceRangeWith(from, to, node);

        dispatch!(tr.scrollIntoView());

        return true;
      }

      return false;
    };
  }

  private toggleLink(): EditorCommand {
    return payload => (state, dispatch) =>
      toggleMark(state.schema.marks.link, payload)(state, dispatch);
  }

  commands() {
    return {
      addLink: this.addLink(),
      toggleLink: this.toggleLink()
    };
  }
}
