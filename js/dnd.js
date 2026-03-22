// dnd.js — Pointer Events drag-and-drop

export function makeSortable(listEl, onReorder, opts) {
  var dragEl = null;
  var dragIndex = -1;
  var placeholder = null;
  var dragOffsetX = 0;
  var dragOffsetY = 0;
  var dragWidth = 0;
  var dragHeight = 0;
  var clampRect = null;  // bounding box for clamping the dragged element
  var curIdx = 0;        // current placeholder insertion index (in otherItems)
  var cleanups = [];
  var options = opts || {};

  function getDraggables() {
    return Array.from(listEl.querySelectorAll(':scope > [data-draggable]'));
  }

  function getOtherItems() {
    return getDraggables().filter(function (el) { return el !== dragEl; });
  }

  function getInsertionIndex(centerX, centerY) {
    var items = getOtherItems();

    // Find which item's bounding box the center overlaps with
    for (var i = 0; i < items.length; i++) {
      var rect = items[i].getBoundingClientRect();
      if (centerX >= rect.left && centerX <= rect.right &&
          centerY >= rect.top && centerY <= rect.bottom) {
        // Center entered item i's area — swap placeholder past it
        if (i >= curIdx) {
          curIdx = i + 1;   // item is at/after placeholder → move placeholder after it
        } else {
          curIdx = i;        // item is before placeholder → move placeholder before it
        }
        return curIdx;
      }
    }

    // Not overlapping any item — check if above all or below all
    if (items.length > 0) {
      var firstRect = items[0].getBoundingClientRect();
      if (centerY < firstRect.top && centerX >= firstRect.left && centerX <= firstRect.right) {
        curIdx = 0;
        return curIdx;
      }
      var lastRect = items[items.length - 1].getBoundingClientRect();
      if (centerY > lastRect.bottom) {
        curIdx = items.length;
        return curIdx;
      }
    }

    // In a gap between items — keep current position
    return curIdx;
  }

  function movePlaceholder(targetIndex) {
    var items = getOtherItems();
    var refEl = items[targetIndex] || null;
    if (refEl) {
      listEl.insertBefore(placeholder, refEl);
    } else {
      // Insert after last draggable but before non-draggable children (e.g. add-card)
      var last = items[items.length - 1];
      if (last) {
        var next = last.nextSibling;
        while (next === dragEl) { next = next.nextSibling; }
        if (next) {
          listEl.insertBefore(placeholder, next);
        } else {
          listEl.appendChild(placeholder);
        }
      } else {
        listEl.appendChild(placeholder);
      }
    }
  }

  // Compute the bounding rect that covers all draggable items (not add-card etc.)
  function computeDraggableBounds() {
    var items = getOtherItems();
    if (items.length === 0) {
      return listEl.getBoundingClientRect();
    }
    // Scan ALL items to find the true bounding box across every row
    var top = Infinity, bottom = -Infinity, left = Infinity, right = -Infinity;
    for (var i = 0; i < items.length; i++) {
      var r = items[i].getBoundingClientRect();
      if (r.top < top) top = r.top;
      if (r.bottom > bottom) bottom = r.bottom;
      if (r.left < left) left = r.left;
      if (r.right > right) right = r.right;
    }
    // Also include the placeholder
    if (placeholder) {
      var phRect = placeholder.getBoundingClientRect();
      if (phRect.top < top) top = phRect.top;
      if (phRect.bottom > bottom) bottom = phRect.bottom;
      if (phRect.left < left) left = phRect.left;
      if (phRect.right > right) right = phRect.right;
    }
    return { top: top, bottom: bottom, left: left, right: right };
  }

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    var target = e.currentTarget;
    if (e.target.closest('button, input, a, [role="button"]')) return;

    var draggables = getDraggables();
    var idx = draggables.indexOf(target);
    if (idx === -1) return;

    dragIndex = idx;
    dragEl = target;
    curIdx = idx;  // placeholder starts at the dragged element's original position

    var rect = dragEl.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    dragWidth = rect.width;
    dragHeight = rect.height;

    // Capture pointer BEFORE DOM changes
    dragEl.setPointerCapture(e.pointerId);
    dragEl.addEventListener('pointermove', onPointerMove);
    dragEl.addEventListener('pointerup', onPointerUp);
    dragEl.addEventListener('pointercancel', onPointerCancel);

    // Create placeholder
    placeholder = document.createElement('div');
    placeholder.style.height = rect.height + 'px';
    placeholder.style.borderRadius = 'var(--radius-md)';
    placeholder.style.border = '2px dashed var(--color-accent)';
    placeholder.style.opacity = '0.4';
    placeholder.style.boxSizing = 'border-box';
    placeholder.style.flexShrink = '0';
    listEl.insertBefore(placeholder, dragEl);

    // Float dragEl above layout
    dragEl.style.position = 'fixed';
    dragEl.style.left = rect.left + 'px';
    dragEl.style.top = rect.top + 'px';
    dragEl.style.width = rect.width + 'px';
    dragEl.style.zIndex = '1000';
    dragEl.style.margin = '0';
    dragEl.style.pointerEvents = 'none';
    dragEl.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
    dragEl.style.opacity = '0.95';
    dragEl.classList.add('is-dragging');

    if (options.onDragStart) options.onDragStart();

    // Compute clamp bounds from the draggable items area
    clampRect = computeDraggableBounds();

    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!dragEl) return;

    // Clamp position within the draggable items area
    var rawLeft = e.clientX - dragOffsetX;
    var rawTop = e.clientY - dragOffsetY;

    var clampedLeft = Math.max(clampRect.left, Math.min(clampRect.right - dragWidth, rawLeft));
    var clampedTop = Math.max(clampRect.top, Math.min(clampRect.bottom - dragHeight, rawTop));

    dragEl.style.left = clampedLeft + 'px';
    dragEl.style.top = clampedTop + 'px';

    // Use the center of the dragged element for insertion calculation
    var centerX = clampedLeft + dragWidth / 2;
    var centerY = clampedTop + dragHeight / 2;
    movePlaceholder(getInsertionIndex(centerX, centerY));
  }

  function _finish(cancelled) {
    if (!dragEl) return;

    dragEl.removeEventListener('pointermove', onPointerMove);
    dragEl.removeEventListener('pointerup', onPointerUp);
    dragEl.removeEventListener('pointercancel', onPointerCancel);

    var toIndex = 0;
    var sibling = placeholder.previousElementSibling;
    while (sibling) {
      if (sibling !== dragEl && sibling.dataset && sibling.dataset.draggable) {
        toIndex++;
      }
      sibling = sibling.previousElementSibling;
    }

    placeholder.parentNode.insertBefore(dragEl, placeholder);
    placeholder.parentNode.removeChild(placeholder);
    placeholder = null;

    dragEl.classList.remove('is-dragging');
    dragEl.style.position = '';
    dragEl.style.left = '';
    dragEl.style.top = '';
    dragEl.style.width = '';
    dragEl.style.zIndex = '';
    dragEl.style.margin = '';
    dragEl.style.pointerEvents = '';
    dragEl.style.boxShadow = '';
    dragEl.style.opacity = '';

    if (options.onDragEnd) options.onDragEnd();

    var from = dragIndex;
    dragEl = null;
    dragIndex = -1;
    curIdx = 0;
    clampRect = null;

    if (!cancelled && from !== toIndex) {
      onReorder(from, toIndex);
    }
  }

  function onPointerUp() { _finish(false); }
  function onPointerCancel() { _finish(true); }

  function attach() {
    getDraggables().forEach(function (el) {
      el.style.touchAction = 'none';
      el.addEventListener('pointerdown', onPointerDown);
      cleanups.push(function () {
        el.removeEventListener('pointerdown', onPointerDown);
      });
    });
  }

  attach();

  return function destroy() {
    cleanups.forEach(function (fn) { fn(); });
    cleanups.length = 0;
  };
}
