import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CountryJournalDialogComponent, CountryJournalDialogData } from '../country-journal-dialog/country-journal-dialog.component';
import { CountryLookupDialogComponent } from '../country-lookup-dialog/country-lookup-dialog.component';

/** One place that opens the dinner journal, so the globe, the header lookup and anything else behave the same. */
@Injectable({
    providedIn: 'root'
})
export class JournalLauncherService
{
    constructor(private _dialog: MatDialog) { }

    public openJournal(country: string)
    {
        return this._dialog.open<CountryJournalDialogComponent, CountryJournalDialogData>(CountryJournalDialogComponent, {
            data: { country },
            width: '680px',
            maxWidth: '95vw',
            maxHeight: '90vh',
            autoFocus: false,
            panelClass: 'journal-dialog-panel'
        });
    }

    public openLookup()
    {
        // Don't stack a second lookup on top of an open dialog
        if (this._dialog.openDialogs.length > 0) return null;

        return this._dialog.open(CountryLookupDialogComponent, {
            width: '460px',
            maxWidth: '95vw',
            position: { top: '80px' },
            autoFocus: 'first-tabbable',
            panelClass: 'lookup-dialog-panel'
        });
    }
}
