import {StorageEngine} from 'multer';
import {Storage} from '@slynova/flydrive';
import {MulterFlydriveOptions} from './types';
import {join} from 'path';
import {pseudoRandomBytes} from 'crypto';

export class FlydriveStorageEngine implements StorageEngine {
    constructor (private readonly opts: MulterFlydriveOptions) {}

    async disk (req, file): Promise<Storage> {
        return this.opts.disk instanceof Storage ? this.opts.disk : this.opts.disk(req, file);
    }

    async destination (req, file): Promise<string> {
        if (typeof this.opts.destination === 'string') return this.opts.destination;
        return this.opts.destination ? this.opts.destination(req, file) : '';
    }

    async filename (req, file): Promise<string> {
        return this.opts.filename ? this.opts.filename(req, file) : this.randomFilename();
    }

    private async randomFilename (): Promise<string> {
        return new Promise((res, rej) => pseudoRandomBytes(16, (err, raw) => {
            err ? rej(err) : res(raw.toString('hex'));
        }));
    }

    async _handleFile (req, file, cb): Promise<void> {
        try {
            const disk = await this.disk(req, file);
            const destination = await Promise.all([this.destination(req, file), this.filename(req, file)]);
            const path = join(...destination);
            await disk.put(path, file.stream);
            const size = (await disk.getProperties(path)).contentLength;
            cb(null, {path, size});
        } catch (err) {
            cb(err);
        }
    }

    async _removeFile (req, file, cb): Promise<void> {
        try {
            const disk = await this.disk(req, file);
            await disk.delete(file.path);
            cb();
        } catch (err) {
            cb(err);
        }
    }
}