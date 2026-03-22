// inline-form.js — reusable inline form component

export class InlineForm {
  constructor(container, fieldDefs, options) {
    this._container = container;
    this._fieldDefs = fieldDefs;
    this._onSubmit = options.onSubmit;
    this._onCancel = options.onCancel;
    this._el = null;
    this._boundKeydown = this._handleKeydown.bind(this);
  }

  render() {
    var self = this;
    var el = document.createElement('div');
    el.className = 'inline-form';

    var fieldsHtml = this._fieldDefs.map(function (def) {
      return '<div class="form-field" data-field="' + def.name + '">' +
        '<label for="iff-' + def.name + '">' + def.label + '</label>' +
        '<input id="iff-' + def.name + '"' +
        ' type="' + def.type + '"' +
        ' value="' + (def.defaultValue != null ? def.defaultValue : '') + '"' +
        (def.min != null ? ' min="' + def.min + '"' : '') +
        (def.max != null ? ' max="' + def.max + '"' : '') +
        (def.maxLength != null ? ' maxlength="' + def.maxLength + '"' : '') +
        ' autocomplete="off" />' +
        '<span class="form-error" aria-live="polite"></span>' +
        '</div>';
    }).join('');

    el.innerHTML = fieldsHtml +
      '<div class="form-actions">' +
      '<button class="btn-primary js-submit">Save</button>' +
      '<button class="btn-ghost js-cancel">Cancel</button>' +
      '</div>';

    this._el = el;
    this._container.appendChild(el);

    el.querySelector('.js-submit').addEventListener('click', function () { self._submit(); });
    el.querySelector('.js-cancel').addEventListener('click', function () { self._cancel(); });
    document.addEventListener('keydown', this._boundKeydown);

    var first = el.querySelector('input');
    if (first) first.focus();
  }

  setValues(values) {
    if (!this._el) return;
    var self = this;
    Object.keys(values).forEach(function (name) {
      var input = self._el.querySelector('#iff-' + name);
      if (input) input.value = values[name];
    });
  }

  getValues() {
    if (!this._el) return {};
    var self = this;
    var result = {};
    this._fieldDefs.forEach(function (def) {
      var input = self._el.querySelector('#iff-' + def.name);
      if (!input) return;
      result[def.name] = def.type === 'number' ? Number(input.value) : input.value;
    });
    return result;
  }

  setErrors(errors) {
    if (!this._el) return;
    this._el.querySelectorAll('.form-error').forEach(function (el) { el.textContent = ''; });
    var self = this;
    Object.keys(errors).forEach(function (name) {
      var field = self._el.querySelector('[data-field="' + name + '"]');
      if (field) {
        var errEl = field.querySelector('.form-error');
        if (errEl) errEl.textContent = errors[name];
      }
    });
  }

  destroy() {
    document.removeEventListener('keydown', this._boundKeydown);
    if (this._el && this._el.parentNode) {
      this._el.parentNode.removeChild(this._el);
    }
    this._el = null;
  }

  _submit() {
    this._onSubmit(this.getValues());
  }

  _cancel() {
    this._onCancel();
  }

  _handleKeydown(e) {
    if (e.key === 'Enter') { e.preventDefault(); this._submit(); }
    else if (e.key === 'Escape') { this._cancel(); }
  }
}
