import { DOMOutputSpecArray } from 'prosemirror-model';
import { EditorCommand } from '@t/spec';
import { cls } from '@/utils/dom';
import Mark from '@/spec/mark';
import { createMarkCommand } from '../helper/mdCommand';

export const reStrong = /^(\*{2}|_{2}).*([\s\S]*)\1$/m;
const strongSyntax = '**';

export class Strong extends Mark {
  get name() {
    return 'strong';
  }

  get schema() {
    return {
      toDOM(): DOMOutputSpecArray {
        return ['span', { class: cls('strong') }, 0];
      }
    };
  }

  private bold(): EditorCommand {
    return createMarkCommand(reStrong, strongSyntax);
  }

  commands() {
    return { bold: this.bold() };
  }

  keymaps() {
    const boldCommand = this.bold()();

    return { 'Mod-b': boldCommand, 'Mod-B': boldCommand };
  }
}
