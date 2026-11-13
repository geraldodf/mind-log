import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  Injector,
  Type,
} from '@angular/core';
import {Observable, Subject} from 'rxjs';

/**
 * Referência a um diálogo aberto pelo `ModalService`. O componente aberto a
 * recebe por injeção e chama `close(resultado)` quando o `app-modal` dele
 * termina de fechar (evento `closed`, já depois da animação de saída).
 */
export class ModalRef<R = unknown> {
  private readonly closedSubject = new Subject<R | undefined>();
  /** Emite uma vez, com o resultado (ou `undefined` quando fechou sem escolher). */
  readonly closed: Observable<R | undefined> = this.closedSubject.asObservable();
  private done = false;

  constructor(private readonly destroy: () => void) {}

  close(result?: R): void {
    if (this.done) return;
    this.done = true;
    this.closedSubject.next(result);
    this.closedSubject.complete();
    this.destroy();
  }
}

/**
 * Abre um componente como diálogo, anexado ao `<body>`. O componente desenha
 * o próprio `<app-modal [open]="true">`; aqui só se cria, injeta o `ModalRef`
 * e destrói. Substitui o `NgbModal`: um único diálogo no app inteiro.
 */
@Injectable({providedIn: 'root'})
export class ModalService {
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly openRefs = new Set<ModalRef<any>>();

  open<C, R = unknown>(component: Type<C>, inputs: Record<string, unknown> = {}): ModalRef<R> {
    let componentRef: ComponentRef<C> | undefined;
    const ref = new ModalRef<R>(() => {
      this.openRefs.delete(ref);
      if (!componentRef) return;
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
    });

    componentRef = createComponent(component, {
      environmentInjector: this.environmentInjector,
      elementInjector: Injector.create({providers: [{provide: ModalRef, useValue: ref}]}),
    });
    for (const [name, value] of Object.entries(inputs)) componentRef.setInput(name, value);

    this.appRef.attachView(componentRef.hostView);
    document.body.appendChild(componentRef.location.nativeElement);
    this.openRefs.add(ref);
    return ref;
  }

  /** Fecha todos sem animação (ex.: fim de sessão, para nada sobrar sobre o login). */
  closeAll(): void {
    [...this.openRefs].forEach(ref => ref.close());
  }
}
