import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { FirebaseService } from '../firebase.service';
import { ManagedUser, UserAdminService } from '../services/user-admin.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit
{
  public currentUser$ = this._firebase.currentUser$;
  public users: ManagedUser[] = [];
  public filtered: ManagedUser[] = [];
  public filter = '';
  public loading = true;
  public loadError = '';
  /** Email of the row being saved, so its controls can be disabled */
  public savingEmail: string | null = null;
  /** Per-row error after a failed change */
  public rowError: { [email: string]: string } = {};

  constructor(
    private _firebase: FirebaseService,
    private _users: UserAdminService,
    private _router: Router,
    private _dialog: MatDialog
  ) { }

  async ngOnInit(): Promise<void>
  {
    await this.load();
  }

  public async load(): Promise<void>
  {
    this.loading = true;
    this.loadError = '';
    try
    {
      this.users = await this._users.listUsers();
      this.applyFilter();
    } catch (e)
    {
      console.error('Failed to load users', e);
      this.loadError = "Couldn't load the user list. Check that the latest firestore.rules are deployed, then try again.";
    } finally
    {
      this.loading = false;
    }
  }

  public onFilterInput(value: string): void
  {
    this.filter = value;
    this.applyFilter();
  }

  private applyFilter(): void
  {
    const q = this.filter.trim().toLowerCase();
    this.filtered = q
      ? this.users.filter(u => u.email.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q))
      : this.users;
  }

  public get adminCount(): number
  {
    return this.users.filter(u => u.isAdmin).length;
  }

  public get contributorCount(): number
  {
    return this.users.filter(u => u.isContributor).length;
  }

  public isMe(user: ManagedUser): boolean
  {
    return user.email.toLowerCase() === this._firebase.currentUser?.email?.toLowerCase();
  }

  public initials(user: ManagedUser): string
  {
    const source = user.displayName || user.email;
    const parts = source.split(/[\s@._-]+/).filter(Boolean);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
  }

  public async toggleContributor(user: ManagedUser, toggle: MatSlideToggle): Promise<void>
  {
    const on = toggle.checked;
    await this.save(user, async () =>
    {
      if (on)
      {
        await this._users.grantContributor(user.email);
        user.contributorDocId = user.email;
      } else
      {
        await this._users.revokeContributor(user);
        user.contributorDocId = null;
      }
      user.isContributor = on;
    });
    // If the save failed, flip the switch back to what's actually stored
    toggle.checked = user.isContributor;
  }

  public makeAdmin(user: ManagedUser): void
  {
    const name = user.displayName || user.email;
    this._dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
      data: {
        title: `Make ${name} an admin?`,
        message: `${name} will be able to manage countries and users, and edit or delete any journal entry. ` +
          `Admins can't be removed here; only in the Firebase console.`,
        confirmLabel: 'Make admin'
      },
      width: '420px', maxWidth: '95vw', autoFocus: 'dialog'
    }).afterClosed().subscribe(async confirmed =>
    {
      if (!confirmed) return;
      await this.save(user, async () =>
      {
        await this._users.grantAdmin(user.email);
        user.isAdmin = true;
      });
    });
  }

  private async save(user: ManagedUser, change: () => Promise<void>): Promise<void>
  {
    this.savingEmail = user.email;
    delete this.rowError[user.email];
    try
    {
      await change();
    } catch (e)
    {
      console.error('Role change failed', e);
      this.rowError[user.email] = "Couldn't save that change. Try again.";
    } finally
    {
      this.savingEmail = null;
    }
  }

  public trackByEmail(_: number, user: ManagedUser): string
  {
    return user.email;
  }

  public goHome(): void
  {
    this._router.navigate(['/']);
  }

  public logout(): void
  {
    this._firebase.logout();
    this._router.navigate(['/']);
  }
}
