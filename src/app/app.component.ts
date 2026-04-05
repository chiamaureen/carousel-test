import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { ProductService, Product } from './product.service';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ButtonModule, CarouselModule, TagModule],
  providers: [ProductService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  products: Product[] = [];

  responsiveOptions: any[] | undefined;

  private unlistenTouchMove?: () => void;

  constructor(
    private productService: ProductService,
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngOnInit() {
    this.productService.getProductsSmall().then((products) => {
      this.products = products;
    });

    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '1199px',
        numVisible: 3,
        numScroll: 1,
      },
      {
        breakpoint: '767px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1,
      },
    ];
  }

  ngAfterViewInit() {
    // 找到真正攔截事件的容器
    const container = this.el.nativeElement.querySelector('.p-carousel-items-container');

    if (container) {
      // 使用捕獲模式 (true) 攔截事件
      // 透過 Renderer2 監聽，並手動判斷
      this.unlistenTouchMove = this.renderer.listen(container, 'touchmove', (event: TouchEvent) => {
        const touch = event.touches[0];
        const movementX = Math.abs(touch.clientX - (container._startX || touch.clientX));
        const movementY = Math.abs(touch.clientY - (container._startY || touch.clientY));

        // 如果垂直移動距離大於水平移動，代表使用者想捲動頁面
        if (movementY > movementX) {
          // 停止事件傳遞給 PrimeNG，這樣它就沒機會呼叫 preventDefault()
          event.stopPropagation();
        }
      });

      // 紀錄起始位置
      this.renderer.listen(container, 'touchstart', (event: TouchEvent) => {
        container._startX = event.touches[0].clientX;
        container._startY = event.touches[0].clientY;
      });
    }
  }

  ngOnDestroy() {
    if (this.unlistenTouchMove) this.unlistenTouchMove();
  }

  
  getSeverity(
    status: string,
  ):
    | 'success'
    | 'secondary'
    | 'info'
    | 'warn'
    | 'danger'
    | 'contrast'
    | undefined {
    switch (status) {
      case 'INSTOCK':
        return 'success';
      case 'LOWSTOCK':
        return 'warn';
      case 'OUTOFSTOCK':
        return 'danger';
      default:
        return undefined;
    }
  }
}
