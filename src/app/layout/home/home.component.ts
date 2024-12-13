import { Component, type OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { TaskComponent } from '../task/task.component';

import { SessioneService } from '../../services/sessione.service';
import { TaskService } from '../../services/task.service';
import { DataService } from '../../services/data.service';

import { TaskModel } from '../../models/task.model';
import { DataModel } from '../../models/data.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ButtonModule,
    //
    SidebarComponent,
    TaskComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private taskService = inject(TaskService);
  private sessioneService = inject(SessioneService);
  private dataService = inject(DataService);

  taskList: TaskModel[] = [];
  statusList: DataModel[] = [];
  categoryList: DataModel[] = [];

  taskListByStatus: any[] = [];

  ngOnInit(): void {
    if (!this.sessioneService.getUserLogged()) {
      this.router.navigate(['/login']);
      return;
    }

    this.dataService.registerStatusList().subscribe({
      next: (response) => {
        this.statusList = response;
      },
      error: (error) => {
        console.log("Errore lettura status:", error);
      }
    });

    this.dataService.registerCategoryList().subscribe({
      next: (response) => {
        this.categoryList = response;
      },
      error: (error) => {
        console.log("Errore lettura categorie:", error);
      }
    });

    this.taskService.registerList().subscribe({
      next: (response) => {
        this.taskList = response;

        this.taskListByStatus = [];
        for (const status of this.sessioneService.getStatusList()) {
          this.taskListByStatus.push({
            status: status,
            tasks: this.taskList.filter(t => t.status == status.id)
          });
        }
      },
      error: (error) => {
        console.log("Errore lettura task:", error);
      }
    });

    this.taskService.getUserTasks(this.sessioneService.getUserLogged()!.id);

  }

  addTask(statusId: number) {
    this.sessioneService.setStatusIdNewTask(statusId);
    this.sessioneService.subjectNewTask.next(true);
  }

}
