import {Pipe, PipeTransform} from '@angular/core';
import {memoize} from "@decorators/memoize";

enum StatusCodeColor {
    Unknown = '#fff',
    Informational = '#007bff',
    Success = '#27cf6d',
    Redirection = '#ebd22c',
    ClientError = '#f02645',
    ServerError = '#c82333'
}

@Pipe({
    name: 'statusCodeColor'
})
export class StatusCodeColorPipe implements PipeTransform {
    @memoize({primitive: true})
    transform(statusCode: number | string): StatusCodeColor {
        if (statusCode && statusCode < 100 || statusCode > 599) return StatusCodeColor.Unknown;

        switch (true) {
            case statusCode < 200:
                return StatusCodeColor.Informational;
            case statusCode < 300:
                return StatusCodeColor.Success;
            case statusCode < 400:
                return StatusCodeColor.Redirection;
            case statusCode < 500:
                return StatusCodeColor.ClientError;
            case statusCode < 600:
                return StatusCodeColor.ServerError;
            default:
                return StatusCodeColor.Unknown;
        }

    }
}

