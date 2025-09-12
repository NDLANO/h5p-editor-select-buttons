/** Class for SelectButtons H5P widget */
export default class SelectButtons {

  /**
   * @class
   * @param {object} parent Parent element in semantics.
   * @param {object} field Semantics field properties.
   * @param {object} params Parameters entered in editor form.
   * @param {function} setValue Callback to set parameters.
   */
  constructor(parent, field, params, setValue) {
    this.parent = parent;
    this.field = field;
    this.params = params;
    this.setValue = setValue;

    if (this.field.type !== 'select') {
      throw new Error('Invalid field type. Expected "select".');
    }

    // Callbacks to call when parameters change
    this.changes = [];

    // Let parent handle ready callbacks of children
    this.passReadies = true;

    this.buttons = [];

    // DOM
    this.$container = H5P.jQuery('<div>', {
      class: 'h5peditor-select-buttons'
    });

    // Instantiate original field (or create your own and call setValue)
    this.fieldInstance = new H5PEditor.widgets[this.field.type](this.parent, this.field, this.params, this.setValue);
    this.value = this.fieldInstance.value;

    this.fieldInstance.appendTo(this.$container);

    // Relay changes
    if (this.fieldInstance.changes) {
      this.fieldInstance.changes.push(() => {
        this.handleFieldChange();
      });
    }

    this.addButtons();

    // Errors
    this.$errors = this.$container.find('.h5p-errors');
  }

  /**
   * Add button for each select option.
   */
  addButtons() {
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'h5peditor-select-buttons-wrapper';

    this.field.options.forEach((option) => {
      const button = this.buildButton(option);
      this.buttons.push(button);
      buttonWrapper.appendChild(button);
    });

    this.fieldInstance.$select.get(0).replaceWith(buttonWrapper);
  }

  /**
   * Build button for select option.
   * @param {object} option Option field from semantics.
   * @param {string} option.label The label of the option.
   * @param {string} option.value The value of the option.
   * @returns {HTMLElement} The button element.
   */
  buildButton(option) {
    const button = document.createElement('button');
    button.classList.add('h5peditor-select-button');
    button.innerText = option.label;
    if (option.value === this.fieldInstance.value) {
      button.classList.add('selected');
    }

    button.addEventListener('click', (event) => {
      this.updateButtons(event.target);
    });

    return button;
  }

  /**
   * Update button states based on the current selection.
   * @param {HTMLElement} buttonClicked The button that was clicked.
   */
  updateButtons(buttonClicked) {
    this.buttons.forEach((button) => {
      button.classList.toggle('selected', button === buttonClicked);

      if (button === buttonClicked) {
        const value = this.field.options.find((opt) => opt.label === button.innerText).value;
        this.value = value;
        this.fieldInstance.$select.get(0).value = value;
        this.fieldInstance.$select.get(0).dispatchEvent(new Event('change'));
      }
    });
  }

  /**
   * Append field to wrapper. Invoked by H5P core.
   * @param {H5P.jQuery} $wrapper Wrapper.
   */
  appendTo($wrapper) {
    $wrapper.get(0).append(this.$container.get(0));
  }

  /**
   * Validate current values. Invoked by H5P core.
   * @returns {boolean} True, if current value is valid, else false.
   */
  validate() {
    return this.fieldInstance.validate();
  }

  /**
   * Remove self. Invoked by H5P core.
   */
  remove() {
    this.$container.get(0).remove();
  }

  /**
   * Handle change of field.
   */
  handleFieldChange() {
    this.params = this.fieldInstance.params;
    this.changes.forEach((change) => {
      change(this.params);
    });
  }
}
