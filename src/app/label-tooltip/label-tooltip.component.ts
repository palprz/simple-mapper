import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-label-tooltip',
  templateUrl: './label-tooltip.component.html',
  styleUrls: ['./label-tooltip.component.scss'],
})
export class LabelTooltipComponent {
  @HostBinding('labelText')
  @Input()
  public labelText: string;

  @HostBinding('tooltipText')
  @Input()
  public tooltipText: string;
}
