import { Component, OnInit } from '@angular/core';

import { CommonComponent } from '../shared/mock/component';

import { CategoryService } from '../shared/services/category.service';
import { TokenService } from '../shared/authentication/token.service';

import { Category } from '../shared/models/category';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'pft-browse-categories',
  templateUrl: './browse-categories.component.html'
})
export class BrowseCategoriesComponent extends CommonComponent implements OnInit {

  public categories: Category[] = [];
  public AWS_S3_PATH = environment.config.AWS_S3_PATH + '/categories';
  public videos_count: any;

  constructor(private categoryService: CategoryService,
    private tokenService: TokenService) {

    super();
  }

  ngOnInit() {

    this.initData(this.categories, this.categoryService.getAllCategories(), () => {
      // I think it's better to recount it to avoid previous errors (wrong number result) signaled by Eldad
      this.categoryService.countVideo().subscribe(
        data => {
          this.videos_count = data;
          this.categories.map((current, category_index) => {
            let index = this.videos_count.map(current_value => current_value.category).indexOf(current._id);
            if(index >= 0) {
              if (this.categories[category_index] && this.categories[category_index].meta && this.categories[category_index].meta.videos) {
                this.categories[category_index].meta.videos = this.videos_count[index].videos_count;
              } else {
                this.categories[category_index].meta = {videos: 0};
                this.categories[category_index].meta.videos = this.videos_count[index].videos_count;
              }
            }
          });
        }, error => {
          console.log(error);
        }
      );
    });
  }
}
