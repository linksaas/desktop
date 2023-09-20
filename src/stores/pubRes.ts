import type { SORT_KEY } from '@/api/appstore';
import { SORT_KEY_UPDATE_TIME } from '@/api/appstore';
import { makeAutoObservable, runInAction } from 'mobx';

export default class PubResStore {
    constructor() {
        makeAutoObservable(this);
    }

    private _appKeyword = "";
    private _appSortKey = SORT_KEY_UPDATE_TIME;
    private _appCurPage = 0;
    private _appMajorCateId = "";
    private _appMinorCateId = "";
    private _appSubMinorCateId = "";
    private _showAppId = "";

    get appKeyword(): string {
        return this._appKeyword;
    }

    set appKeyword(val: string) {
        runInAction(() => {
            this._appKeyword = val;
        });
    }

    get appSortKey(): SORT_KEY {
        return this._appSortKey;
    }

    set appSortKey(val: SORT_KEY) {
        runInAction(() => {
            this._appSortKey = val;
        });
    }

    get appCurPage(): number {
        return this._appCurPage;
    }

    set appCurPage(val: number) {
        runInAction(() => {
            this._appCurPage = val;
        });
    }

    get appMajorCateId(): string {
        return this._appMajorCateId;
    }

    set appMajorCateId(val: string) {
        runInAction(() => {
            this._appMajorCateId = val;
        });
    }

    get appMinorCateId(): string {
        return this._appMinorCateId;
    }

    set appMinorCateId(val: string) {
        runInAction(() => {
            this._appMinorCateId = val;
        });
    }

    get appSubMinorCateId(): string {
        return this._appSubMinorCateId;
    }

    set appSubMinorCateId(val: string) {
        runInAction(() => {
            this._appSubMinorCateId = val;
        });
    }

    get showAppId(): string {
        return this._showAppId;
    }

    set showAppId(val: string) {
        runInAction(() => {
            this._showAppId = val;
        });
    }
}
