import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { LabelTooltipComponent } from './label-tooltip/label-tooltip.component';

@NgModule({
  declarations: [AppComponent, LabelTooltipComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
