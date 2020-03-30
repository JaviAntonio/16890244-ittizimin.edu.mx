import { Injectable, NgZone } from '@angular/core';
import { User } from '../service/user';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable ({
    providedIn: 'root'
})

export class AuthService {
    userData: any;

    constructor (
        public afs: AngularFirestore,
        public afAuth: AngularFireAuth,
        public router: Router,
        public ngZone: NgZone
    ){

this.afAuth.authState.subscribe(user =>{
    if (user){
        this.userData= user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user'));
    }else{
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'));
        }
    })
 }

SignIn(email, password){
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
    .then((result) => {
        this.ngZone.run(() =>{
            this.router.navigate(['dashboard']);
        });
        this.SetUserData(result.user);
    }).catch((error)=>{
        window.alert(error.message)
    })

}
//metodo para regitro de usuario 
SignUp(email, password){
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
    .then((result)=>{
this.SendVerificationMail();
this.SetUserData(result.user);
    }).catch((error)=>{
        window.alert(error.message)
    })
}

SendVerificationMail(){
    return this.afAuth.auth.currentUser.sendEmailVerification()
    .then(()=>{
this.router.navigate(['verify-email-address']);
    })
}
//metodo para enviar un correo de recuperación de contraseña
ForgotPassword(passwordResetEmail){
    return this.afAuth.auth.sendPasswordResetEmail(passwordResetEmail)
    .then(()=>{
        window.alert('Correo electrónico de restablecimiento de contraseña enviado, revise su bandeja de entrada.')
    }).catch((error)=>{
        window.alert(error)
    })
}

get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return(user !== null && user.emailVeridied !== false) ? true: false;

}
//iniciar sesion cn una cuenta de google

GoogleAuth(){
    return this.AuthLogin(new auth.GoogleAuthProvider());
}

AuthLogin(provider){
    return this.afAuth.auth.signInWithPopup(provider)
    .then((result)=>{
        this.ngZone.run(()=>{
            this.router.navigate(['dashboard']);
        })
        this.SetUserData(result.user);
    }).catch((error)=>{
        window.alert(error)
    })
}

SetUserData(user){
const UserRef: AngularFirestoreDocument<any>= this.afs.doc(`users/${user.uid}`);
const userData: User ={
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVeridied
}
return UserRef.set(userData,{
    merge: true
    })
}

//cerrar sesion
SignOut(){
    return this.afAuth.auth.signOut().then(()=>{
        localStorage.removeItem('user');
        this.router.navigate(['sign-in']);
        })
    }
}