/* tslint:disable */
/// <reference path="../jquery/jquery.d.ts"/>

interface DatePickerChangeEvent extends JQueryEventObject {
    date: any;
    oldDate: any;
}

interface DatePickerEvent extends JQueryEventObject {
    date: any;
}
