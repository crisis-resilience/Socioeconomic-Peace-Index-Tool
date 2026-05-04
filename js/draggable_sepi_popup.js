/**
 * Drag district / SEPI Leaflet popups by the header bar
 * (root: .sepi-popup or .pillar-popup; handle: .sepi-popup-header).
 */
export function attachDraggableSepiPopups(map) {
    if (!map?.on) return;

    map.on('popupopen', (e) => {
        const popup = e.popup;
        const root = popup?.getElement?.();
        if (
            !root?.classList?.contains('sepi-popup') &&
            !root?.classList?.contains('pillar-popup')
        ) {
            return;
        }

        const handle = root.querySelector('.sepi-popup-header');
        if (!handle) return;

        let dragging = false;
        let startMouse;
        /** Container pixel of popup anchor at mousedown — fixed for whole drag */
        let startAnchorPx;

        const onMove = (ev) => {
            if (!dragging || !startMouse || !startAnchorPx) return;
            const cur = map.mouseEventToContainerPoint(ev);
            const deltaMouse = L.point(cur.x - startMouse.x, cur.y - startMouse.y);
            const nextPx = L.point(startAnchorPx.x + deltaMouse.x, startAnchorPx.y + deltaMouse.y);
            popup.setLatLng(map.containerPointToLatLng(nextPx));
            popup.update();
        };

        const onUp = () => {
            if (!dragging) return;
            dragging = false;
            L.DomEvent.off(document, 'mousemove', onMove);
            L.DomEvent.off(document, 'mouseup', onUp);
            map.dragging?.enable();
        };

        const onDown = (ev) => {
            if (ev.type === 'mousedown' && ev.button !== 0) return;
            if (ev.target?.closest?.('.leaflet-popup-close-button')) return;

            L.DomEvent.preventDefault(ev);
            L.DomEvent.stopPropagation(ev);

            dragging = true;
            startMouse = map.mouseEventToContainerPoint(ev);
            const startLatLng = popup.getLatLng();
            startAnchorPx = map.latLngToContainerPoint(startLatLng);
            map.dragging?.disable();
            L.DomEvent.on(document, 'mousemove', onMove);
            L.DomEvent.on(document, 'mouseup', onUp);
        };

        L.DomEvent.on(handle, 'mousedown', onDown);

        const onPopupClose = (closeEv) => {
            if (closeEv.popup !== popup) return;
            L.DomEvent.off(handle, 'mousedown', onDown);
            L.DomEvent.off(document, 'mousemove', onMove);
            L.DomEvent.off(document, 'mouseup', onUp);
            map.dragging?.enable();
            map.off('popupclose', onPopupClose);
        };
        map.on('popupclose', onPopupClose);
    });
}
