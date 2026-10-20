import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal.tsx';

describe('Modal Dialog A11y & Focus', () => {
  it('renders modal with role="dialog", aria-modal="true", and aria-labelledby', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Audit Log">
        <p>Modal body content</p>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title-audit-log');
    expect(screen.getByText('Audit Log')).toBeInTheDocument();
  });

  it('triggers onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Escape Test">
        <p>Press escape</p>
      </Modal>
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="Hidden Modal">
        <p>Hidden</p>
      </Modal>
    );
    expect(container.firstChild).toBeNull();
  });
});
