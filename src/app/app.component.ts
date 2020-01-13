import { Component } from '@angular/core';
import { ProductsService } from './products.service';
import { Observer, Observable } from 'rxjs';
import { Product } from './product.model';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  simpleReqProductsObs$: Observable<Product[]>
  productsErrorHandling: Product[];
  productsErrorLoading: Product[];
  bLoading: boolean = false;
  productsId: Product[];
  newlyProducts: Product[] = [];

  constructor(private productsService: ProductsService, private snackBar: MatSnackBar){
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    
  }

  getSimpleHttpRequest(){
    //this.productsService.getProducts().subscribe(prods=>console.log(prods));
    this.simpleReqProductsObs$ = this.productsService.getProducts();
  }

  getProductsWithErrorHandling(){
    this.productsService.getProductsError()
      .subscribe(
        (prods)=>{this.productsErrorHandling = prods},
        (err)=>{
          console.log(err);
          console.log("Message: " + err.error.msg);
          console.log("Status Code: " + err.status);

          let config = new MatSnackBarConfig();
          config.duration = 2000;
          config.panelClass = ['snack_error']; //fica no styles.css global

          if(err.status == 0)
            this.snackBar.open('Could not connect to the server','',config);
          else
            this.snackBar.open(err.error.msg,'',config);

      });
  }

  getProductsWithErrorHandlingOK(){
    this.productsService.getProductsDelay()
      .subscribe(
        (prods)=>{
          this.productsErrorHandling = prods
          let config = new MatSnackBarConfig();
          config.duration = 2000;
          config.panelClass = ['snack_ok']; //fica no styles.css global

          this.snackBar.open('Products successfuly loades!','',config);
        },
        (err)=>{
          console.log(err);
      });
  }

  getProductsLoading(){
    this.bLoading = true;
    this.productsService.getProductsDelay()
      .subscribe(
        (prods)=>{
          this.productsErrorLoading = prods
          this.bLoading = false;
        },
        (err)=>{
          console.log(err);
          this.bLoading = false;
      });
  }

  getProductsIds(){
    this.productsService.getProductsIds()
      .subscribe((ids)=>{
        this.productsId = ids.map(id=>({_id: id, name: '', department: '', price: 0}));
      });
  }

  loadName(id: string){
    console.log(id);
    this.productsService.getProduName(id)
      .subscribe((name)=>{
        let index = this.productsId.findIndex(p=>p._id===id)
        if(index >=0){
          this.productsId[index].name = name;
        }
      });
  }

  saveProduct(name: string, department: string, price: number){
    let p = {name, department, price};
    this.productsService.saveProduct(p)
      .subscribe(
      (p:Product)=>{
        console.log(p);
        this.newlyProducts.push(p);
      },
      (err)=>{
        console.log(err);
        let config = new MatSnackBarConfig();
        config.duration = 2000;
        config.panelClass = ['snack_error']; //fica no styles.css global

        if(err.status == 0)
          this.snackBar.open('Could not connect to the server','',config);
        else
          this.snackBar.open(err.error.msg,'',config);
      });
  }

}
