import { LightsDBService } from './lights-db.service';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';

// Firebase
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Light {
  level: number;
  levelAVG: number;
  levelCount: number;
  location: string;
  id: string;
  state: number;
  time: number;
  timeGreenAVG: number;
  timeRedAVG: number;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./index.scss']
})
export class AppComponent implements AfterViewInit {
  // Chart
  view: any[] = [400, 300];
  single: any[] = [
    {
      name: 'Semáforo',
      series: [
        {
          name: 0,
          value: 0
        }
      ]
    }
  ];
  colorScheme = {
    domain: ['#5fcffd']
  };

  // Variables
  items: Observable<Light[]>;
  lightToggle = false;
  currentItem;
  currentID: string;
  greenLights: number;
  redLights: number;
  level: number;
  graphAbove: number;
  lightsMap: number[];
  @ViewChild('panelContainer')
  panelContainer: ElementRef;
  constructor(
    private afs: AngularFirestore,
    public lightsDBService: LightsDBService
  ) {
    this.items = this.lightsDBService.getLights();
    this.items.subscribe(data => {
      this.lightsMap = [];
      let count = 0;
      this.level = 0;
      this.greenLights = 0;
      this.redLights = 0;
      data.forEach(light => {
        if (light.state === 0) {
          this.redLights += 1;
        } else {
          this.greenLights += 1;
        }
        this.level += light.level;
        count += 1;
        this.lightsMap.push(light.state);
      });
      this.level = this.level / count;
    });
  }
  ngAfterViewInit() {
    this.view = [
      this.panelContainer.nativeElement.offsetWidth,
      this.panelContainer.nativeElement.offsetWidth * 0.75
    ];
    this.graphAbove = this.panelContainer.nativeElement.offsetWidth * 0.75;
  }

  toggleLight() {
    this.lightToggle = !this.lightToggle;
  }
  setCurrentItem(a) {
    this.currentID = a;
    this.lightsDBService.getItem(a).subscribe(data => {
      this.currentItem = data;
    });
    this.lightsDBService.getLightDensity(a).subscribe(data => {
      const seriesRef = [];
      let currentDate;
      data.forEach(valueRef => {
        currentDate = new Date(null);
        currentDate.setSeconds(valueRef.date.seconds);
        console.log(valueRef.date.seconds);
        console.log(currentDate);
        seriesRef.push({
          name: currentDate,
          value: valueRef.level
        });
      });
      this.single = [
        {
          name: 'Semáforo ' + this.currentID,
          series: seriesRef
        }
      ];
    });
  }
  changeState(id, state) {
    this.lightsDBService.updateLight(this.currentID, state);
  }
  getLightState(id) {
    return this.lightsMap[id] === 0;
  }
}
