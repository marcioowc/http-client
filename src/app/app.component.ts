import { Component } from '@angular/core';
import { ProductsService } from './products.service';
import { Observer, Observable } from 'rxjs';
import { Product } from './product.model';
import { MatSnackBar, MatSnackBarConfig, MatDialog } from '@angular/material';
import { DialogEditProductComponent } from './dialog-edit-product/dialog-edit-product.component';

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
  productsToDelete: Product[];
  productsToEdit: Product[];

  constructor(
    private productsService: ProductsService, 
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ){
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

  loadProductsToDelete(){
    this.productsService.getProducts()
      .subscribe((prods)=>this.productsToDelete = prods); 
  }

  deleteProduct(p: Product){
    this.productsService.deleteProduct(p)
      .subscribe(
        (res) =>{
          let i = this.productsToDelete.findIndex(prod=>p._id==prod._id);
          if(i>=0)
            this.productsToDelete.splice(i, 1);
        },
        (err) =>{
          console.log(err);
        }
      )
  }
  loadProductsToEdit(){
    this.productsService.getProducts()
      .subscribe((prods)=>this.productsToEdit = prods); 
  }

  editProduct(p: Product){
    //let newProduct: Product = Object.assign({},p);
    let newProduct: Product = {...p /*, _id: 1234*/}; //faz o merge (como se fosse o copy-buffer except)
    let dialogRef = this.dialog.open(DialogEditProductComponent, {width: '400px', data: newProduct});

    dialogRef.afterClosed()
      .subscribe((res: Product)=>{
        //console.log(res);
        if(res)
          this.productsService.editProduct(res)
            .subscribe(
              (resp)=>{
                let i = this.productsToEdit.findIndex(prod=>p._id==prod._id);
                if(i>=0)
                  this.productsToEdit[i] = resp;
              },
              (err)=>{
                console.log(err);
              }
            );
      });
  }

}
