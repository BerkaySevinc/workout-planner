export class ConfirmationModal {
  /**
   * Show a confirmation dialog.
   * @param {string} message
   * @returns {Promise<boolean>} true if confirmed, false if cancelled
   */
  static show(message) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';

      const dialog = document.createElement('div');
      dialog.className = 'modal-dialog';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-label', 'Confirmation');

      dialog.innerHTML = `
        <p class="modal-message">${message}</p>
        <div class="modal-actions">
          <button class="btn-ghost js-cancel">Cancel</button>
          <button class="btn-danger js-confirm">Delete</button>
        </div>
      `;

      overlay.appendChild(dialog);
      document.body.appendChild(overlay);

      let closed = false;
      const close = value => {
        if (closed) return;
        closed = true;
        overlay.remove();
        resolve(value);
      };

      const confirmBtn = dialog.querySelector('.js-confirm');
      const cancelBtn = dialog.querySelector('.js-cancel');

      // Explicit keyboard handling — prevent events from leaking out
      confirmBtn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopImmediatePropagation();
          close(true);
        }
      });
      cancelBtn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopImmediatePropagation();
          close(false);
        }
      });

      // Click handlers
      confirmBtn.addEventListener('click', e => { e.stopPropagation(); close(true); });
      cancelBtn.addEventListener('click', e => { e.stopPropagation(); close(false); });

      // Escape — handled on dialog, removed automatically with DOM
      dialog.addEventListener('keydown', e => {
        if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); close(false); }
      });

      // Click outside
      overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });

      // Trap keyboard inside modal — prevent Tab from leaving
      dialog.addEventListener('keydown', e => {
        if (e.key !== 'Tab') return;
        const focusable = [cancelBtn, confirmBtn];
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });

      // Focus confirm button — rAF ensures DOM is painted and focus works reliably
      requestAnimationFrame(() => confirmBtn.focus());
    });
  }
}
