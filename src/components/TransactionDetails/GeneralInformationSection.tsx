import { DataSection } from './DataSection';
import { DetailField } from './DetailField';

interface GeneralInformationProps {
  type: string;
  kind: string | null;
  networkFlow: string;
  status: string;
  createdAt: string;
  expectedAt: string | null;
}

export const GeneralInformationSection = ({
  type,
  kind,
  networkFlow,
  status,
  createdAt,
  expectedAt
}: GeneralInformationProps) => {
  return (
    <DataSection title="General Information" showDivider>
      <DetailField kind="status" label="Status" value={status} />
      <DetailField label="Transaction Type" value={type} bold />
      {kind && <DetailField label="Transaction Kind" value={kind} />}
      <DetailField label="Network Flow" value={networkFlow} />
      <DetailField label="Created" value={createdAt} tooltip="When the transaction was created" />
      {expectedAt && (
        <DetailField label="Expected" value={expectedAt} tooltip="Expected completion time" />
      )}
    </DataSection>
  );
};
