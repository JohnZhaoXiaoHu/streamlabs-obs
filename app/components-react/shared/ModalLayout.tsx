import React, { ReactNode, CSSProperties } from 'react';
import { useVuex } from '../hooks';
import { Services } from '../service-provider';
import { getOS, OS } from '../../util/operating-systems';
import cx from 'classnames';
import { $t } from '../../services/i18n';
import css from './ModalLayout.m.less';
import { Button } from 'antd';
import { ModalProps } from 'antd/lib/modal';
import Scrollable from './Scrollable';

// use props of Modal from the antd lib
type TProps = {
  children: ReactNode;
  fixedChild?: ReactNode;
  hideFooter?: boolean;
  scrollable?: boolean;
} & Pick<ModalProps, 'footer' | 'onOk' | 'okText' | 'confirmLoading'>;

// calculate OS dependent styles
const titleHeight = getOS() === OS.Mac ? 22 : 30;
const footerHeight = 53;
const wrapperStyles: CSSProperties = {
  height: `calc(100% - ${titleHeight}px)`,
};
const fixedStyles: CSSProperties = {
  height: '200px',
  background: 'var(--section)',
  margin: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

/**
 * Wraps content for the child windows
 */
export function ModalLayout(p: TProps) {
  const bodyStyles: CSSProperties = {
    height: p.fixedChild
      ? `calc(100% - ${footerHeight + 200}px)`
      : `calc(100% - ${footerHeight}px)`,
  };

  // inject services
  const { WindowsService, CustomizationService } = Services;

  // define a vuex state
  const v = useVuex(() => ({ currentTheme: CustomizationService.currentTheme }), false);

  // define a close method for the modal
  function close() {
    WindowsService.actions.closeChildWindow();
  }

  // render a default footer with action buttons
  function DefaultFooter() {
    const okText = p.okText || $t('Done');
    return (
      <>
        <Button onClick={close}>{$t('Close')}</Button>
        {p.onOk && (
          <Button onClick={p.onOk} type="primary" disabled={p.confirmLoading}>
            {p.confirmLoading && (
              <i className="fa fa-pulse fa-spinner" style={{ marginRight: 8 }} />
            )}
            {okText}
          </Button>
        )}
      </>
    );
  }

  return (
    <div className={cx('ant-modal-content', v.currentTheme)} style={wrapperStyles}>
      {p.fixedChild && <div style={fixedStyles}>{p.fixedChild}</div>}

      {p.scrollable ? (
        <div style={bodyStyles}>
          <Scrollable isResizable={false} style={{ height: '100%' }}>
            <div className="ant-modal-body">{p.children}</div>
          </Scrollable>
        </div>
      ) : (
        <div className="ant-modal-body" style={bodyStyles}>
          {p.children}
        </div>
      )}

      {!p.hideFooter && <div className="ant-modal-footer">{p.footer || <DefaultFooter />}</div>}
    </div>
  );
}
