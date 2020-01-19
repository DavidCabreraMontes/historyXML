import { Component } from '@angular/core';
import xml2js from 'xml2js'
import { HttpClient, HttpHeaders } from '@angular/common/http'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'historyXML';
  public xmlItems:any;
  constructor(private http:HttpClient){ 
    this.loadXML();
  }
  loadXML(){
    this.http.get('/assets/users.xml',
    {
      headers: new HttpHeaders().set('Content-Type','text/xml')
      .append('Access-Control-Allow-Methods','GET')
      .append('Access-Control-Allow-Origin','*')
      .append('Access-Control-Allow-Headers',"Access-Control-Allow-Headers,Access-Control-Allow-Origin,Access-Control-Allow-Methods"),
      responseType: 'text'
    }).subscribe((data) => {
      this.parseXML(data).then((data) => {
        this.xmlItems = data
      })
    })
  }
  parseXML(data){
    return new Promise(resolve => {
      var k: string | number, 
      arr = [],
      parser = new xml2js.Parser({
        trim: true,
        explicitArray: true
      })
      parser.parseString(data, function( err, result){
        var obj = result.Employee;
        for (k in obj.emp){
          var item = obj.emp[k]
          arr.push({
            id: item.id[0],
            name: item.name[0],
            gender: item.gender[0],
            mobile: item.mobile[0]
          })
        }
        resolve(arr)
      })
    })
  }
}

