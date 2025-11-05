import * as React from 'react';
import './progressmy.less'

interface IProgressMYProps {
	percent: number;
}

export const ProgressMy: React.FunctionComponent<IProgressMYProps> = (props: IProgressMYProps) => {
	const { percent } = props;
	return (
		<div className="progress_wraper">
			<div className="progress_left">
				<div className="progress_bottom">
					<div className="progress_top" style={{ width: (percent ? percent : 0) + '%' }} />
				</div>
			</div>
			<span className="progress_right">{percent + '%'}</span>
		</div>
	);
};
