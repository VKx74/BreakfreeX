export class InMemoryStorageService {
    private static _linkingKey = "cross-app-linking";
    private static _memory: { [id: string]: any; } = {};

    static get(key: string): any {
        return InMemoryStorageService._memory[key];
    }

    static set(key: string, value: any) {
        InMemoryStorageService._memory[key] = value;
    }

    static delete(key: string): any {
        InMemoryStorageService._memory[key] = undefined;
    }

    static getLinking(): any {
        return InMemoryStorageService.get(InMemoryStorageService._linkingKey);
    }

    static setLinking(data: any) {
        return InMemoryStorageService.set(InMemoryStorageService._linkingKey, data);
    }

    static deleteLinking() {
        return InMemoryStorageService.delete(InMemoryStorageService._linkingKey);
    }
}