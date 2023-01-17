import { Directive, HostListener, HostBinding, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[pftDnd]'
})
export class DndDirective {

  @Output() fileDropped = new EventEmitter<any>();

  @HostBinding('class.fileover') fileOver: boolean;

  @HostListener('dragover', ['$event']) onDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    this.fileOver = true;
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    this.fileOver = false;
  }

  @HostListener('drop', ['$event']) public ondrop(event) {
    event.preventDefault();
    event.stopPropagation();
    this.fileOver = false;
    
    const files = event.dataTransfer.files;
    this.fileOver = false;
    if(files.length > 0){

      console.log("you dropped some files");
      this.fileDropped.emit(files);
    }
  }

  constructor() { }
}
