import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
export interface Light {
  level: number;
  levelAVG: number;
  levelCount: number;
  location: string;
  state: number;
  time: number;
  timeGreenAVG: number;
  timeRedAVG: number;
}
export interface LightId extends Light { id: string; }

@Injectable({ providedIn: 'root' })

export class LightsDBService {
  private lightsCollection: AngularFirestoreCollection<Light>;
  lightsList: Observable<LightId[]>;
  private itemDoc: AngularFirestoreDocument<Light>;
  items: Observable<Light[]>;
  constructor(private afs: AngularFirestore) {
    this.lightsCollection = afs.collection<Light>('Lights', ref => ref.orderBy('id'));
    this.lightsList = this.lightsCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Light;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
  }
  getLights() {
    return this.lightsList;
  }
  getItem(id) {
    const itemDoc = this.afs.doc<any>('Lights/' + id);
    return itemDoc.valueChanges();
  }
  getLightDensity(id) {
    const itemDoc = this.afs.collection<any>('Lights/' + id + '/Density', ref => ref.orderBy('date'));
    return itemDoc.valueChanges();
  }
  updateLight(id, state) {
    const itemDoc = this.afs.doc<any>('Lights/' + id);
    if (state === 0) {
    itemDoc.update({state: 1});
    } else {
    itemDoc.update({state: 0});
    }
  }
}
