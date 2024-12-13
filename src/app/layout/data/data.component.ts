import { Component, Input, type OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { Tooltip } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ColorPicker } from 'primeng/colorpicker';

import { SessioneService } from '../../services/sessione.service';
import { DataService } from '../../services/data.service';

import { DataEnum, DataModel } from '../../models/data.model';

@Component({
  selector: 'app-data',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    Tooltip,
    InputTextModule,
    InputNumber,
    ButtonModule,
    ColorPicker,
  ],
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
})
export class DataComponent implements OnInit {

  private sessioneService = inject(SessioneService);
  private dataService = inject(DataService);

  dataEnum = DataEnum;
  dataType: DataEnum = DataEnum.Category;
  dataList: DataModel[] = [];
  clonedData: { [s: number]: DataModel } = {};

  ngOnInit(): void {
    this.dataService.registerDataLoad().subscribe({
      next: (response) => {
        this.dataType = response as DataEnum;
        this.loadData();
      }
    });

    this.dataService.registerDataSave().subscribe({
      next: (response) => {
        if (response) {
          this.loadData();
        }
      }
    });
  }

  private loadData() {
    if (this.dataType == DataEnum.Category) {
      this.dataList = this.sessioneService.getCategoryList().sort((a, b) => a.sort - b.sort);
    }
    else if (this.dataType == DataEnum.Status) {
      this.dataList = this.sessioneService.getStatusList().sort((a, b) => a.sort - b.sort);
    }
  }

  iconDataToVis(iconName: string) {
    return iconName.replace('fas ', '');
  }

  iconVisToData(iconName: string) {
    if (!iconName.startsWith('fas ')) return "fas " + iconName
    else return iconName;
  }

  onRowEditInit(data: DataModel){
    this.clonedData[data.id] = {...data};
  }

  onRowEditSave(data: DataModel){
    if (!data.description || data.description.length == 0) {
      this.sessioneService.sendErrorMessage("Inserire una descrizione valida");
      return;
    }
    if (!data.icon || data.icon.length == 0) {
      this.sessioneService.sendErrorMessage("Inserire un'icona' valida");
      return;
    }

    this.dataService.saveData(this.dataType, data);

    delete this.clonedData[data.id];
    this.sessioneService.sendSuccessMessage("Dati salvati correttamente");

  }

  onRowEditCancel(data: DataModel, index: number){
    this.dataList[index] = this.clonedData[data.id];
    delete this.clonedData[data.id];
  }

}
