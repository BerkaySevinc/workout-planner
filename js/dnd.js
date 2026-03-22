// dnd.js — Pointer Events drag-and-drop

export function makeSortable(listEl, onReorder) {
  var dragEl = null;
  var dragIndex = -1;
  var startY = 0;
  var hoverIndex = -1;
  var placeholder = null;
  var cleanups = [];

  function getDraggables() {
    return Array.from(listEl.querySelectorAll(':scope > [data-draggable]'));
  }

  function getIndex(el) {
    return getDraggables().indexOf(el);
  }

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    var target = e.currentTarget;
    if (!target.dataset.draggable) return;
    if (e.target.closest('button, input, a, [role="button"]')) return;

    dragEl = target;
    dragIndex = getIndex(dragEl);
    startY = e.clientY;
    hoverIndex = dragIndex;

    dragEl.setPointerCapture(e.pointerId);
    dragEl.classList.add('is-dragging');

    placeholder = document.createElement('div');
    placeholder.style.height = dragEl.offsetHeight + 'px';
    placeholder.style.borderRadius = 'var(--radius-md)';
    placeholder.style.border = '2px dashed var(--color-accent)';
    placeholder.style.opacity = '0.4';
    placeholder.style.flexShrink = '0';
    dragEl.parentNode.insertBefore(placeholder, dragEl.nextSibling);

    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!dragEl) return;

    var deltaY = e.clientY - startY;
    dragEl.style.transform = 'translateY(' + deltaY + 'px)';
    dragEl.style.zIndex = '50';
    dragEl.style.position = 'relative';

    var draggables = getDraggables();
    var newHover = dragIndex;

    for (var i = 0; i < draggables.length; i++) {
      if (draggables[i] === dragEl) continue;
      var rect = draggables[i].getBoundingClientRect();
      var mid = rect.top + rect.height / 2;
      if (e.clientY > mid) {
        newHover = i;
      }
    }

    if (newHover !== hoverIndex) {
      hoverIndex = newHover;
      var draggables2 = getDraggables();
      var refEl = draggables2[hoverIndex];
      if (refEl && refEl !== dragEl) {
        if (hoverIndex > dragIndex) {
          refEl.parentNode.insertBefore(placeholder, refEl.nextSibling);
        } else {
          refEl.parentNode.insertBefore(placeholder, refEl);
        }
      }
    }
  }

  function onPointerUp() {
    if (!dragEl) return;

    var from = dragIndex;
    var to = hoverIndex;

    dragEl.classList.remove('is-dragging');
    dragEl.style.transform = '';
    dragEl.style.zIndex = '';
    dragEl.style.position = '';

    if (placeholder && placeholder.parentNode) {
      placeholder.parentNode.removeChild(placeholder);
    }
    placeholder = null;

    if (from !== to) {
      onReorder(from, to);
    }

    dragEl = null;
    dragIndex = -1;
    hoverIndex = -1;
  }

  function onPointerCancel() {
    if (!dragEl) return;
    dragEl.classList.remove('is-dragging');
    dragEl.style.transform = '';
    dragEl.style.zIndex = '';
    dragEl.style.position = '';
    if (placeholder && placeholder.parentNode) {
      placeholder.parentNode.removeChild(placeholder);
    }
    placeholder = null;
    dragEl = null;
    dragIndex = -1;
    hoverIndex = -1;
  }

  function attach() {
    getDraggables().forEach(function (el) {
      el.style.touchAction = 'none';
      el.addEventListener('pointerdown', onPointerDown);
      el.addEventListener('pointermove', onPointerMove);
      el.addEventListener('pointerup', onPointerUp);
      el.addEventListener('pointercancel', onPointerCancel);
      cleanups.push(function () {
        el.removeEventListener('pointerdown', onPointerDown);
        el.removeEventListener('pointermove', onPointerMove);
        el.removeEventListener('pointerup', onPointerUp);
        el.removeEventListener('pointercancel', onPointerCancel);
      });
    });
  }

  attach();

  return function destroy() {
    cleanups.forEach(function (fn) { fn(); });
    cleanups.length = 0;
  };
}
