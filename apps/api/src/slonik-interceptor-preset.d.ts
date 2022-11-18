declare module 'slonik-interceptor-preset' {
  import { Interceptor } from 'slonik';

  type UserConfigurationType = {
    /**
     * Dictates whether to enable the [query benchmarking interceptor](https://github.com/gajus/slonik-interceptor-query-benchmarking). (Default: false)
     */
    benchmarkQueries?: boolean;
    /**
     * Dictates whether to enable the [query logging interceptor](https://github.com/gajus/slonik-interceptor-query-logging). (Default: true)
     */
    logQueries?: boolean;
    /**
     * Dictates whether to enable the [query normalisation interceptor](https://github.com/gajus/slonik-interceptor-query-normalisation). (Default: true)
     */
    normaliseQueries?: boolean;
    /**
     * Dictates whether to enable the [field name transformation interceptor](https://github.com/gajus/slonik-interceptor-field-name-transformation). (Default: true)
     */
    transformFieldNames?: boolean;
  };

  export function createInterceptors(
    userConfiguration?: UserConfigurationType,
  ): ReadonlyArray<Interceptor>;
}
