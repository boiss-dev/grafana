import React, { Component } from 'react';
import classNames from 'classnames';
import { isEqual } from 'lodash';
import { DataLink, LoadingState, PanelData, PanelMenuItem, QueryResultMetaNotice, ScopedVars } from '@grafana/data';
import { AngularComponent } from '@grafana/runtime';
import { ClickOutsideWrapper, Icon, Tooltip } from '@grafana/ui';
import { selectors } from '@grafana/e2e-selectors';
import XLSX from 'xlsx';
import FileSaver from 'file-saver';

import PanelHeaderCorner from './PanelHeaderCorner';
import { PanelHeaderMenu } from './PanelHeaderMenu';
import templateSrv from 'app/features/templating/template_srv';

import { DashboardModel } from 'app/features/dashboard/state/DashboardModel';
import { PanelModel } from 'app/features/dashboard/state/PanelModel';
import { getPanelLinksSupplier } from 'app/features/panel/panellinks/linkSuppliers';
import { getPanelMenu } from 'app/features/dashboard/utils/getPanelMenu';
import { updateLocation } from 'app/core/actions';
import { config } from 'app/core/config';

export interface Props {
  panel: PanelModel;
  dashboard: DashboardModel;
  title?: string;
  description?: string;
  scopedVars?: ScopedVars;
  angularComponent?: AngularComponent | null;
  links?: DataLink[];
  error?: string;
  alertState?: string;
  isViewing: boolean;
  isEditing: boolean;
  data: PanelData;
  updateLocation: typeof updateLocation;
}

interface ClickCoordinates {
  x: number;
  y: number;
}

interface State {
  panelMenuOpen: boolean;
  menuItems: PanelMenuItem[];
}

export class PanelHeader extends Component<Props, State> {
  clickCoordinates: ClickCoordinates = { x: 0, y: 0 };

  state: State = {
    panelMenuOpen: false,
    menuItems: [],
  };

  eventToClickCoordinates = (event: React.MouseEvent<HTMLDivElement>) => {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  };

  onMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    this.clickCoordinates = this.eventToClickCoordinates(event);
  };

  isClick = (clickCoordinates: ClickCoordinates) => {
    return isEqual(clickCoordinates, this.clickCoordinates);
  };

  onMenuToggle = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!this.isClick(this.eventToClickCoordinates(event))) {
      return;
    }

    event.stopPropagation();

    const { dashboard, panel, angularComponent } = this.props;
    const menuItems = getPanelMenu(dashboard, panel, angularComponent);

    this.setState({
      panelMenuOpen: !this.state.panelMenuOpen,
      menuItems,
    });
  };

  closeMenu = () => {
    this.setState({
      panelMenuOpen: false,
    });
  };

  onCancelQuery = () => {
    this.props.panel.getQueryRunner().cancelQuery();
  };

  private renderLoadingState(): JSX.Element {
    return (
      <div className="panel-loading" onClick={this.onCancelQuery}>
        <Tooltip content="Cancel query">
          <Icon className="panel-loading__spinner spin-clockwise" name="sync" />
        </Tooltip>
      </div>
    );
  }

  onExportExcelClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    const { panel, data } = this.props;

    let fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let excelData = this.buildExcelData(data.series[0]);

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: fileType });
    let filename = panel.title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .trim();
    FileSaver.saveAs(file, filename + '.xlsx');

    event.stopPropagation();
  };

  buildExcelData(serie: any): any[] {
    let excelData: any[] = [];
    let i: number;
    for (i = 0; i < serie.length; i++) {
      var record: { [key: string]: any } = {};
      serie.fields.forEach((field: { name: string; values: any }) => {
        if (field.name.toLowerCase() === 'time') {
          var d = new Date(field.values.buffer[i]);
          record[field.name] = d;
        } else {
          record[field.name] = field.values.buffer[i];
        }
      });
      excelData.push(record);
    }
    console.log(excelData);
    return excelData;
  }

  openInspect = (e: React.SyntheticEvent, tab: string) => {
    const { updateLocation, panel } = this.props;

    e.stopPropagation();

    updateLocation({
      query: { inspect: panel.id, inspectTab: tab },
      partial: true,
    });
  };

  renderNotice = (notice: QueryResultMetaNotice) => {
    return (
      <Tooltip content={notice.text} key={notice.severity}>
        {notice.inspect ? (
          <div className="panel-info-notice pointer" onClick={e => this.openInspect(e, notice.inspect!)}>
            <Icon name="info-circle" style={{ marginRight: '8px' }} />
          </div>
        ) : (
          <a className="panel-info-notice" href={notice.link} target="_blank">
            <Icon name="info-circle" style={{ marginRight: '8px' }} />
          </a>
        )}
      </Tooltip>
    );
  };

  render() {
    const { panel, scopedVars, error, isViewing, isEditing, data, alertState } = this.props;
    const { menuItems } = this.state;
    const title = templateSrv.replaceWithText(panel.title, scopedVars);
    const { isCollabInstance } = config;

    const panelHeaderClass = classNames({
      'panel-header': true,
      'grid-drag-handle': !(isViewing || isEditing),
    });

    // dedupe on severity
    const notices: Record<string, QueryResultMetaNotice> = {};

    for (const series of data.series) {
      if (series.meta && series.meta.notices) {
        for (const notice of series.meta.notices) {
          notices[notice.severity] = notice;
        }
      }
    }

    return (
      <>
        {data.state === LoadingState.Loading && this.renderLoadingState()}
        <div className={panelHeaderClass}>
          <PanelHeaderCorner
            panel={panel}
            title={panel.title}
            description={panel.description}
            scopedVars={panel.scopedVars}
            links={getPanelLinksSupplier(panel)}
            error={error}
          />
          <div
            className="panel-title-container"
            onClick={this.onMenuToggle}
            onMouseDown={this.onMouseDown}
            aria-label={selectors.components.Panels.Panel.title(title)}
          >
            <div className="panel-title">
              {Object.values(notices).map(this.renderNotice)}
              {alertState && (
                <Icon
                  name={alertState === 'alerting' ? 'heart-break' : 'heart'}
                  className="icon-gf panel-alert-icon"
                  style={{ marginRight: '4px' }}
                  size="sm"
                />
              )}
              <span className="panel-title-text">
                {title}
                <Icon name="angle-down" className="panel-menu-toggle" />
              </span>
              {this.state.panelMenuOpen && (
                <ClickOutsideWrapper onClick={this.closeMenu}>
                  <PanelHeaderMenu items={menuItems} />
                </ClickOutsideWrapper>
              )}
              {data.request && data.request.timeInfo && (
                <span className="panel-time-info">
                  <Icon name="clock-nine" size="sm" /> {data.request.timeInfo}
                </span>
              )}
              {panel.type === 'table' && !isCollabInstance && (
                <span className="export-excel" onClick={this.onExportExcelClick}>
                  <Icon name="file-download-alt" size="xl" />
                </span>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}
