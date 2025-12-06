import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FirebaseService } from './firebase.service';
import { map, take, tap } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state) =>
{
    const firebaseService = inject(FirebaseService);
    const router = inject(Router);

    return firebaseService.isAdmin$.pipe(
        take(1),
        map(isAdmin => isAdmin), // lol ai
        tap(isAdmin =>
        {
            if (!isAdmin)
            {
                router.navigate(['/']);
            }
        })
    );
};
