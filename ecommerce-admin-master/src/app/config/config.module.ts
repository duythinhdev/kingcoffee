import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigRoutingModule } from './config.routing';
import { MediaModule } from '../media/media.module';

import { ConfigsComponent } from './list/configs.component';

import { ConfigService } from './service';
import { UtilsModule } from '../utils/utils.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    //our custom module
    ConfigRoutingModule,
    MediaModule,
    UtilsModule
  ],
  declarations: [
    ConfigsComponent
  ],
  providers: [ConfigService]
})
export class ConfigModule { }
