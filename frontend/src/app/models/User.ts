export class User {
    id: number;
    username: string;
    email: string;
    last_login: Date;
    date_joined: Date;

    constructor(id: number);
    constructor(id: number, username: string);
    constructor(id: number, username: string, email: string);
    constructor(id: number, username?: string, email?: string)
    constructor(id: number, username?: string, email?: string, last_login?: Date, date_joined?: Date) {
        this.id = id;
        this.username = username || '';
        this.email = email || '';
        this.last_login = last_login || new Date();
        this.date_joined = date_joined || new Date();
    }
}