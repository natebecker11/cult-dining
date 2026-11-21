import { Injectable } from '@angular/core';
import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { FirebaseService } from '../firebase.service';

/** One row in Manage Users */
export interface ManagedUser
{
    email: string;
    displayName: string;
    photoURL: string;
    /** Null when the person is on an allowlist but hasn't signed in since sign-ins started being recorded */
    lastSeen: Date | null;
    isAdmin: boolean;
    isContributor: boolean;
    /** The Contributors doc ID as stored (casing may differ from the sign-in email) */
    contributorDocId: string | null;
}

/**
 * Manage Users: everyone who has signed in (Users collection) plus anyone already on the
 * Admins or Contributors allowlists. firestore.rules enforces the same limits as the screen:
 * only admins grant roles, and nobody can remove an admin.
 */
@Injectable({ providedIn: 'root' })
export class UserAdminService
{
    constructor(private _firebase: FirebaseService) { }

    async listUsers(): Promise<ManagedUser[]>
    {
        const db = this._firebase.db;
        const [users, admins, contributors] = await Promise.all([
            getDocs(collection(db, 'Users')),
            getDocs(collection(db, 'Admins')),
            getDocs(collection(db, 'Contributors'))
        ]);
        const adminEmails = new Set(admins.docs.map(d => d.id.toLowerCase()));
        const contributorIds = new Map(contributors.docs.map(d => [d.id.toLowerCase(), d.id]));

        const byEmail = new Map<string, ManagedUser>();
        const row = (email: string): ManagedUser => ({
            email,
            displayName: '',
            photoURL: '',
            lastSeen: null,
            isAdmin: adminEmails.has(email.toLowerCase()),
            isContributor: contributorIds.has(email.toLowerCase()),
            contributorDocId: contributorIds.get(email.toLowerCase()) ?? null
        });

        for (const d of users.docs)
        {
            const data = d.data();
            if (typeof data['email'] !== 'string') continue;
            const lastSeen = data['lastSeen'] instanceof Timestamp ? data['lastSeen'].toDate() : null;
            const existing = byEmail.get(data['email'].toLowerCase());
            // Keep the most recent sign-in if one email somehow has two accounts
            if (existing?.lastSeen && lastSeen && existing.lastSeen > lastSeen) continue;
            byEmail.set(data['email'].toLowerCase(), {
                ...row(data['email']),
                displayName: data['displayName'] ?? '',
                photoURL: data['photoURL'] ?? '',
                lastSeen
            });
        }
        // People granted a role in the console who haven't signed in since this list started
        for (const d of [...admins.docs, ...contributors.docs])
        {
            if (!byEmail.has(d.id.toLowerCase())) byEmail.set(d.id.toLowerCase(), row(d.id));
        }

        // Most recently seen first; never-seen at the end, alphabetically
        return [...byEmail.values()].sort((a, b) =>
            (b.lastSeen?.getTime() ?? 0) - (a.lastSeen?.getTime() ?? 0)
            || (a.displayName || a.email).localeCompare(b.displayName || b.email));
    }

    /** Can't be undone from the app (see firestore.rules) */
    grantAdmin(email: string): Promise<void>
    {
        return this.grant('Admins', email);
    }

    grantContributor(email: string): Promise<void>
    {
        return this.grant('Contributors', email);
    }

    async revokeContributor(user: ManagedUser): Promise<void>
    {
        await deleteDoc(doc(this._firebase.db, 'Contributors', user.contributorDocId ?? user.email));
        if (this.isMe(user.email)) await this._firebase.refreshRoles();
    }

    private isMe(email: string): boolean
    {
        return email.toLowerCase() === this._firebase.currentUser?.email?.toLowerCase();
    }

    private async grant(collectionName: 'Admins' | 'Contributors', email: string): Promise<void>
    {
        await setDoc(doc(this._firebase.db, collectionName, email), {
            email,
            grantedBy: this._firebase.currentUser?.email ?? '',
            grantedAt: serverTimestamp()
        });
        // An admin changing their own roles sees the change right away (e.g. the journal's Add buttons)
        if (this.isMe(email)) await this._firebase.refreshRoles();
    }
}
