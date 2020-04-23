export class EventsHelper {
    static triggerWindowResize() {
        window.dispatchEvent(new Event('resize'));
    }
}