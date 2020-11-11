export class Settings {

    constructor(
        public transportMode: string
    ) { }

    static defaults(): Settings {
        return new Settings('cycling');
    }
}
