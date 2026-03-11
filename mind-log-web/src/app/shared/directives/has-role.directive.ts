import { Directive, Input, TemplateRef, ViewContainerRef } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { RolesEnum } from "../../enums/roles.enum";

@Directive({
    selector: '[appHasRole]'
})

export class HasHoleDirective {
    private userRoles: readonly RolesEnum[] = [];

    constructor (private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef, private authService: AuthService){
        this.userRoles = this.authService.getUserRolesSafe();
    }

    @Input() set appHasRole(allowedRoles: RolesEnum[]){
        if (allowedRoles.some(role => this.userRoles.includes(role))){
            this.viewContainer.createEmbeddedView(this.templateRef);
        
        } else{
            this.viewContainer.clear();
        }
    }
}