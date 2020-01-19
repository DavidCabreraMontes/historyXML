import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor() { }
  urlXML:string
  nombreXML="No se seleccionado ningun archivo"
  ngOnInit() {
  }
  subirXML(e){
    this.urlXML = e.target.value;
    this.nombreXML="No se seleccionado ningun archivo"
    if(e.target.files[0]){
      this.nombreXML = e.target.files[0].name
    }
    
    console.log(this.urlXML)
    console.log(this.nombreXML)
    let fecha= new Date()
    let year =fecha.getFullYear()
    let month = fecha.getMonth()+1
    let day = fecha.getDate()
    console.log(day+"/"+month+"/"+year)
  }
}
