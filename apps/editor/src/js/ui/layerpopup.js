/**
 * @fileoverview Implements LayerPopup
 * @author NHN FE Development Lab <dl_javascript@nhn.com>
 */
import $ from 'jquery';
import extend from 'tui-code-snippet/object/extend';
import isExisty from 'tui-code-snippet/type/isExisty';

import UIController from './uicontroller';

const CLASS_PREFIX = 'tui-popup-';
const CLASS_FIT_WINDOW = 'fit-window';

const LAYOUT_TEMPLATE_MODELESS = `<div class="${CLASS_PREFIX}header">
        <span class="${CLASS_PREFIX}title"></span>
        <div class="${CLASS_PREFIX}header-buttons">
            <button type="button" class="${CLASS_PREFIX}close-button"></button>
        </div>
    </div>
    <div class="${CLASS_PREFIX}body"></div>`;

const LAYOUT_TEMPLATE_MODAL = `<div class="${CLASS_PREFIX}wrapper">
        <div class="${CLASS_PREFIX}header">
            <span class="${CLASS_PREFIX}title"></span>
            <div class="${CLASS_PREFIX}header-buttons">
                <button type="button" class="${CLASS_PREFIX}close-button"></button>
            </div>
        </div>
        <div class="${CLASS_PREFIX}body"></div>
    </div>`;

/**
 * A number, or a string containing a number.
 * @typedef {object} LayerPopupOption
 * @property {string[]} [openerCssQuery] - Css Query list to bind clickevent that open popup
 * @property {string[]} [closerCssQuery] - Css Query list to bind clickevent that close popup
 * @property {jQuery} $el - popup root element
 * @property {jQuery|string} [content] - popup content that html string or jQuery element
 * @property {string} [textContent] - popup text content
 * @property {string} title - popup title
 * @property {boolean} [header] - whether to draw header
 * @property {jQuery} [$target] - element to append popup
 * @property {boolean} modal - true: modal, false: modeless
 * @property {string} [headerButtons] - replace header(close) button
 */

/**
 * Class LayerPopup
 * @param {LayerPopupOption} options - popup option
 */
class LayerPopup extends UIController {
  constructor(options) {
    options = extend(
      {
        header: true,
        $target: $('body'),
        textContent: ''
      },
      options
    );
    super({
      tagName: 'div',
      className: options.modal ? `${CLASS_PREFIX}modal-background` : `${CLASS_PREFIX}wrapper`,
      rootElement: options.$el
    });

    this._initInstance(options);
    this._initDOM(options);
    this._initDOMEvent(options);
    this._initEditorEvent(options);
  }

  /**
   * init instance.
   * store properties & prepare before initialize DOM
   * @param {LayerPopupOption} options - layer popup options
   * @private
   */
  _initInstance(options) {
    this._$target = options.$target;

    if (options.$el) {
      this.$el = options.$el;
      this._isExternalHtmlUse = true;
    }

    if (options.content) {
      this.$content = $(options.content);
    } else {
      this.$content = options.textContent;
    }

    this.options = options;
  }

  /**
   * initialize DOM, render popup
   * @private
   */
  _initDOM() {
    this._initLayout();

    if (!this._isExternalHtmlUse) {
      if (isExisty(this.options.title)) {
        this.setTitle(this.options.title);
      }
      this.setContent(this.$content);
    }

    const buttons = this.options.headerButtons;

    if (buttons) {
      this.$el.find(`.${CLASS_PREFIX}close-button`).remove();

      const $buttonWrapper = this.$el.find(`.${CLASS_PREFIX}header-buttons`);

      $buttonWrapper.empty();
      $buttonWrapper.append($(buttons));
    }

    if (this.options.css) {
      this.$el.css(this.options.css);
    }
  }

  /**
   * bind DOM events
   * @private
   */
  _initDOMEvent() {
    const { openerCssQuery, closerCssQuery } = this.options;

    if (openerCssQuery) {
      $(openerCssQuery).on(`click.${this._id}`, () => this.show());
    }
    if (closerCssQuery) {
      $(closerCssQuery).on(`click.${this._id}`, () => this.hide());
    }

    this.on(`click .${CLASS_PREFIX}close-button`, () => this.hide());
  }

  /**
   * bind editor events
   * @private
   * @abstract
   */
  _initEditorEvent() {}

  _initLayout() {
    const { options } = this;

    if (!this._isExternalHtmlUse) {
      const layout = options.modal ? LAYOUT_TEMPLATE_MODAL : LAYOUT_TEMPLATE_MODELESS;

      this.$el.html(layout);
      this.$el.addClass(options.className);
      this.hide();
      this._$target.append(this.$el);
      this.$body = this.$el.find(`.${CLASS_PREFIX}body`);

      if (!options.header) {
        this.$el.find(`.${CLASS_PREFIX}header`).remove();
      }
    } else {
      this.hide();
      this._$target.append(this.$el);
    }
  }

  /**
   * set popup content
   * @param {jQuery|HTMLElement|string} $content - content
   */
  setContent($content) {
    this.$body.empty();
    this.$body.append($content);
  }

  /**
   * set title
   * @param {string} title - title text
   */
  setTitle(title) {
    const $title = this.$el.find(`.${CLASS_PREFIX}title`);

    $title.empty();
    $title.append(title);
  }

  /**
   * get title element
   * @returns {HTMLElement} - title html element
   */
  getTitleElement() {
    return this.$el.find(`.${CLASS_PREFIX}title`).get(0);
  }

  /**
   * hide popup
   */
  hide() {
    this.$el.css('display', 'none');
    this._isShow = false;
    this.trigger('hidden', this);
  }

  /**
   * show popup
   */
  show() {
    this.$el.css('display', 'block');
    this._isShow = true;
    this.trigger('shown', this);
  }

  /**
   * whether this popup is visible
   * @returns {boolean} - true: shown, false: hidden
   */
  isShow() {
    return this._isShow;
  }

  /**
   * remove popup content
   */
  remove() {
    const { openerCssQuery, closerCssQuery } = this.options;

    this.trigger('remove', this);
    this.off();

    if (openerCssQuery) {
      $(openerCssQuery).off(`.${this._id}`);
    }
    if (closerCssQuery) {
      $(closerCssQuery).off(`.${this._id}`);
    }

    this.$el.remove();
    this.$el = null;
  }

  /**
   * make popup size fit to window
   * @param {boolean} fit - true to make popup fit to window
   * @protected
   * @ignore
   */
  setFitToWindow(fit) {
    this.$el.toggleClass(CLASS_FIT_WINDOW, fit);
  }

  /**
   * make popup size fit to window
   * @returns {boolean} - true for fit to window
   * @protected
   * @ignore
   */
  isFitToWindow() {
    return this.$el.hasClass(CLASS_FIT_WINDOW);
  }

  /**
   * toggle size fit to window
   * @returns {boolean} - true for fit to window
   * @protected
   * @ignore
   */
  toggleFitToWindow() {
    const fitToWindow = !this.isFitToWindow();

    this.setFitToWindow(fitToWindow);

    return fitToWindow;
  }
}

export default LayerPopup;
