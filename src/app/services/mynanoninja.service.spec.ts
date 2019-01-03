import { TestBed, inject } from '@angular/core/testing';

import { MyNanoNinjaService } from './mynanoninja.service';

describe('MyNanoNinjaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MyNanoNinjaService]
    });
  });

  it('should be created', inject([MyNanoNinjaService], (service: MyNanoNinjaService) => {
    expect(service).toBeTruthy();
  }));
});
