import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateChatModalComponent } from './private-chat-modal.component';

describe('PrivateChatModalComponent', () => {
  let component: PrivateChatModalComponent;
  let fixture: ComponentFixture<PrivateChatModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivateChatModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivateChatModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
