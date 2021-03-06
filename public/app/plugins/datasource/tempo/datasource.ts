import {
  DataQuery,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
} from '@grafana/data';
import { DataSourceWithBackend } from '@grafana/runtime';
import { TraceToLogsData, TraceToLogsOptions } from 'app/core/components/TraceToLogsSettings';
import { getDatasourceSrv } from 'app/features/plugins/datasource_srv';
import { merge, Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { LokiOptions } from '../loki/types';
import { transformTrace, transformTraceList } from './resultTransformer';

export type TempoQueryType = 'search' | 'traceId';

export type TempoQuery = {
  query: string;
  // Query to find list of traces, e.g., via Loki
  linkedQuery?: DataQuery;
  queryType: TempoQueryType;
} & DataQuery;

export class TempoDatasource extends DataSourceWithBackend<TempoQuery, TraceToLogsData> {
  tracesToLogs: TraceToLogsOptions;
  linkedDatasource: DataSourceApi;
  constructor(instanceSettings: DataSourceInstanceSettings<TraceToLogsData>) {
    super(instanceSettings);
    this.tracesToLogs = instanceSettings.jsonData.tracesToLogs || {};
    if (this.tracesToLogs.datasourceUid) {
      this.linkDatasource();
    }
  }

  async linkDatasource() {
    const dsSrv = getDatasourceSrv();
    this.linkedDatasource = await dsSrv.get(this.tracesToLogs.datasourceUid);
  }

  query(options: DataQueryRequest<TempoQuery>): Observable<DataQueryResponse> {
    const subQueries: Array<Observable<DataQueryResponse>> = [];
    const filteredTargets = options.targets.filter((target) => !target.hide);
    const searchTargets = filteredTargets.filter((target) => target.queryType === 'search');
    const traceTargets = filteredTargets.filter(
      (target) => target.queryType === 'traceId' || target.queryType === undefined
    );

    // Run search queries on linked datasource
    if (this.linkedDatasource && searchTargets.length > 0) {
      // Wrap linked query into a data request based on original request
      const linkedRequest: DataQueryRequest = { ...options, targets: searchTargets.map((t) => t.linkedQuery!) };
      // Find trace matchers in derived fields of the linked datasource that's identical to this datasource
      const settings: DataSourceInstanceSettings<LokiOptions> = (this.linkedDatasource as any).instanceSettings;
      const traceLinkMatcher: string[] =
        settings.jsonData.derivedFields
          ?.filter((field) => field.datasourceUid === this.uid && field.matcherRegex)
          .map((field) => field.matcherRegex) || [];
      if (!traceLinkMatcher || traceLinkMatcher.length === 0) {
        subQueries.push(
          throwError(
            'No Loki datasource configured for search. Set up Derived Fields for traces in a Loki datasource settings and link it to this Tempo datasource.'
          )
        );
      } else {
        subQueries.push(
          (this.linkedDatasource.query(linkedRequest) as Observable<DataQueryResponse>).pipe(
            map((response) =>
              response.error ? response : transformTraceList(response, this.uid, this.name, traceLinkMatcher)
            )
          )
        );
      }
    }

    if (traceTargets.length > 0) {
      const traceRequest: DataQueryRequest<TempoQuery> = { ...options, targets: traceTargets };
      subQueries.push(
        super.query(traceRequest).pipe(
          map((response) => {
            if (response.error) {
              return response;
            }
            return transformTrace(response);
          })
        )
      );
    }

    return merge(...subQueries);
  }

  async testDatasource(): Promise<any> {
    const response = await super.query({ targets: [{ query: '', refId: 'A' }] } as any).toPromise();

    if (!response.error?.message?.startsWith('failed to get trace')) {
      return { status: 'error', message: 'Data source is not working' };
    }

    return { status: 'success', message: 'Data source is working' };
  }

  getQueryDisplayText(query: TempoQuery) {
    return query.query;
  }
}
