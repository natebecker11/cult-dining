import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FirebaseService } from './firebase.service';
import { filter, map, switchMap, take } from 'rxjs/operators';

/** Admin pages only. Waits for Firebase to restore the sign-in, so a direct link or reload works. */
export const adminGuard: CanActivateFn = () =>
{
    const firebaseService = inject(FirebaseService);
    const router = inject(Router);

    return firebaseService.rolesReady$.pipe(
        filter(ready => ready),
        take(1),
        switchMap(() => firebaseService.isAdmin$.pipe(take(1))),
        map(isAdmin => isAdmin || router.createUrlTree(['/']))
    );
};
