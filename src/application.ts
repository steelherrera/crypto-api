import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, createBindingFromClass} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import { AuthenticationComponent } from '@loopback/authentication';
import { AuthorizationComponent } from '@loopback/authorization';
import {GeneralUtilities} from './utils/general';
import { UtilsBindings } from './keys';
import { CurrenciesCronJob } from './cron';
import { CronComponent } from '@loopback/cron';

export {ApplicationConfig};

export class CurrencyApiApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.component(AuthenticationComponent);
    this.component(AuthorizationComponent);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    //Add cron job to boot
    this.component(CronComponent);
    this.add(createBindingFromClass(CurrenciesCronJob));
    

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    this.setUpBindings();
  }

  private setUpBindings(): void {
    this.bind(UtilsBindings.UTILS).toClass(GeneralUtilities);
  }
}
