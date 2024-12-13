import { Component, Input, type OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { Avatar } from 'primeng/avatar';
import { Skeleton } from 'primeng/skeleton';
import { Tooltip } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { PickList } from 'primeng/picklist';
import { ConfirmPopupModule } from 'primeng/confirmpopup';

import { ConfirmationService } from 'primeng/api';
import { TaskService } from '../../services/task.service';
import { UtilityService } from '../../services/utility.service';
import { SessioneService } from '../../services/sessione.service';
import { UserService } from '../../services/user.service';

import { TaskModel, TaskExtendModel, ShowModeEnum } from '../../models/task.model';
import { UserAvatarModel } from '../../models/user.model';
import { UserModel } from '../../models/user.model';
import { DataModel } from '../../models/data.model';


@Component({
  selector: 'app-task',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    Avatar,
    Skeleton,
    Tooltip,
    Dialog,
    InputGroup,
    InputGroupAddonModule,
    InputTextModule,
    Select,
    TextareaModule,
    PickList,
    ConfirmPopupModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
})
export class TaskComponent implements OnInit {
  @Input() taskId!: number;

  task!: TaskExtendModel;

  private taskService = inject(TaskService);
  private utilityService = inject(UtilityService);
  private sessioneService = inject(SessioneService);
  private userService = inject(UserService);
  private confirmationService = inject(ConfirmationService);

  showModeEnum = ShowModeEnum;
  showMode: ShowModeEnum = ShowModeEnum.VIEW;
  showDialog: boolean = false;

  userAvatarList: UserAvatarModel[] = [];

  statusColor: string = "#FFFFFF";

  customSkeleton: any = {
    colorScheme: {
      light: {
        root: {
          background: '#b1bec6',
          animationBackground: '#d9d9d9'
        },
      },
      dark: {
          root: {
            background: '#b1bec6',
            animationBackground: '#d9d9d9'
          }
      }
    }
  };

  dialogTitle: string = '';
  newTask: TaskModel = {
    id: 0,
    title: '',
    description: '',
    status: 0,
    category: 0,
    users: [],
  }
  userList: UserModel[] = [];
  userListToAdd: UserModel[] = [];
  userListAvailable: UserModel[] = [];

  statusList: DataModel[] = [];
  categoryList: DataModel[] = [];

  ngOnInit(): void {
    this.taskService.registerRead().subscribe({
      next: (task: TaskExtendModel) => {
        if (task.id != this.taskId) return;
        this.task = task;

        if (task.statusExtend && task.statusExtend.color) {
          this.statusColor = task.statusExtend.color;
        }

        if (task.users) {
          this.userAvatarList = task.usersExtend.map(user => {
            return {
              id: user.id,
              label: this.utilityService.getAvatarLabel(user),
              background: user.background,
            }
          });
        }

      },
      error: (error) => {
        console.log(error);
      }

    });

    if (this.taskId != 0) this.taskService.getTaskById(this.taskId);
    else this.showMode = ShowModeEnum.NONE;

    this.userService.registerList().subscribe({
      next: (response) => {
        this.userList = response;
      },
      error: (error) => {
        console.log("Errore lettura utenti:", error);
      }
    });
    this.userService.getUserList();

    this.statusList = this.sessioneService.getStatusList();
    this.categoryList = this.sessioneService.getCategoryList();

    this.sessioneService.registerNewTask().subscribe({
      next: (response) => {
        if (this.taskId == 0) {
          if (response) this.addTask();
          else {
            this.closeDialog();
            this.showMode = ShowModeEnum.NONE;
          }
        }
      },
      error: (error) => {
        console.log("Errore lettura status:", error);
      }
    });

    this.taskService.registerReload().subscribe({
      next: () => {
        if (this.taskId != 0) this.taskService.getTaskById(this.taskId);
      },
      error: (error) => {
        console.log("Errore lettura task:", error);
      }
    });
  }

  addTask() {
    console.log("addTask - ID:", this.taskId);
    this.initDataDialog();
    this.dialogTitle = "Nuovo task";
    this.showMode = ShowModeEnum.NEW;
    this.newTask = {
      id: 0,
      title: '',
      description: '',
      status: this.sessioneService.getStatusIdNewTask(),
      category: 0,
      users: [],
    };
    this.showDialog = true;
  }

  saveTask() {
    if (!this.checkData()) return;

    if (this.userListToAdd.length > 0) {
      this.newTask.users = this.userListToAdd.map(x => x.id);
    }

    this.taskService.registerSave().subscribe({
      next: (response) => {
        if (response != this.newTask.id) return;
        console.log("Task salvato correttamente:", response);
        this.showDialog = false;
        this.taskService.getUserTasks(this.sessioneService.getUserLogged()!.id);
        this.sessioneService.sendSuccessMessage("Task salvato correttamente");
        this.closeDialog();
      },
      error: (error) => {
        console.log("Errore salvataggio task:", error);
        this.sessioneService.sendErrorMessage("Errore salvataggio task");
      }
    });

    if (this.newTask.id == 0) this.taskService.saveTask(this.newTask);
    else this.taskService.updateTask(this.newTask);
  }

  editTask(task: TaskExtendModel){
    console.log("Modifica task", task.id);
    this.initDataDialog();
    this.dialogTitle = "Modifica task";
    this.showMode = ShowModeEnum.EDIT;
    this.newTask = task;
    this.showDialog = true;

    console.log("Categoria:", this.newTask.category);
  }

  deleteTask(event: any, task: TaskExtendModel){
    console.log("Cancellazione task", task.id);
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: "Sei sicuro di voler cancellare il task?",
      icon: "fas fa-triangle-exclamation",
      rejectButtonProps: {
        label: 'Annulla',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
          label: 'Conferma'
      },
      accept: () => {
          this.executeDeleteTask(task);
      },
      /*reject: () => {
          this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
      }*/
    })
  }

  executeDeleteTask(task: TaskExtendModel) {
    this.taskService.registerDelete().subscribe({
      next: () => {
        this.showDialog = false;
        this.taskService.getUserTasks(this.sessioneService.getUserLogged()!.id);
        this.sessioneService.sendSuccessMessage("Task cancellato correttamente");
      },
      error: (error) => {
        console.log("Errore cancellazione task:", error);
        this.sessioneService.sendErrorMessage("Errore cancellazione task");
      }
    });
    this.taskService.deleteTask(task.id);
  }

  closeDialog() {
    this.showDialog = false;
    if (this.taskId == 0) this.showMode = ShowModeEnum.NONE;
    else this.showMode = ShowModeEnum.VIEW;
  }

  private initDataDialog() {
    /*
    this.userService.registerList().subscribe({
      next: (response) => {
        this.userList = response;
        if (this.newTask.id == 0) this.userListToAdd = [this.sessioneService.getUserLogged()!];
        else this.userListToAdd = this.task.usersExtend;
        this.userListAvailable = this.userList.filter(u => !this.userListToAdd.map(u => u.id).includes(u.id));
      },
      error: (error) => {
        console.log("Errore lettura utenti:", error);
      }
    });
    */

    this.userService.getUserList();
    if (this.newTask.id == 0) this.userListToAdd = [this.sessioneService.getUserLogged()!];
    else this.userListToAdd = this.task.usersExtend;
    this.userListAvailable = this.userList.filter(u => !this.userListToAdd.map(u => u.id).includes(u.id));
  }

  checkData() {
    let retValue = true;

    let field = document.getElementById('txtTitle');
    if (field) {
      if (!this.newTask.title || this.newTask.title.length == 0) {
        field.classList.add('ng-invalid')
        field.classList.add('ng-dirty');
        retValue = false;
      }
      else {
        field.classList.remove('ng-invalid')
        field.classList.remove('ng-dirty');
      }
    }

    field = document.getElementById('txtDescription');
    if (field) {
      if (!this.newTask.description || this.newTask.description.length == 0) {
        field.classList.add('ng-invalid')
        field.classList.add('ng-dirty');
        retValue = false;
      }
      else {
        field.classList.remove('ng-invalid')
        field.classList.remove('ng-dirty');
      }
    }

    field = document.getElementById('cmbCategory');
    if (field) {
      if (!this.newTask.category || this.newTask.category == 0) {
        field.classList.add('ng-invalid')
        field.classList.add('ng-dirty');
        retValue = false;
      }
      else {
        field.classList.remove('ng-invalid')
        field.classList.remove('ng-dirty');
      }
    }

    field = document.getElementById('cmbStatus');
    if (field) {
      if (!this.newTask.status || this.newTask.status == 0) {
        field.classList.add('ng-invalid')
        field.classList.add('ng-dirty');
        retValue = false;
      }
      else {
        field.classList.remove('ng-invalid')
        field.classList.remove('ng-dirty');
      }
    }

    return retValue;
  }

}
