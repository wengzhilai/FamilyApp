import { NgModule } from '@angular/core';
import { FileUploadModule } from 'ng2-file-upload';
import { IonicPageModule } from 'ionic-angular';
import { PipesModule } from "../pipes/pipes.module";
import { IonicUpFileComponent } from './ionic-up-file/ionic-up-file';
import { UpFileComponent } from './up-file/up-file';

@NgModule({
	declarations: [
		UpFileComponent,
		IonicUpFileComponent,
	],
	imports: [
		FileUploadModule,
		IonicPageModule,
		PipesModule,
	],
	exports: [
		UpFileComponent,
		IonicUpFileComponent,
	]
})
export class ComponentsModule { }
