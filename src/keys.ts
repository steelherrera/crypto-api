// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/context';
import { GeneralUtilities } from './utils/general';

export namespace UtilsBindings {
  export const UTILS = BindingKey.create<GeneralUtilities>(
    'utils.general',
  );
}
