import {Request} from "express";
import {Storage} from '@slynova/flydrive';

export type MulterFlydriveOptionsFunction = ((
    req?: Request,
    file?: Express.Multer.File,
) => string | Promise<string>);

export interface MulterFlydriveOptions {
    disk: Storage,
    destination?: string | MulterFlydriveOptionsFunction;
    filename?: MulterFlydriveOptionsFunction;
}