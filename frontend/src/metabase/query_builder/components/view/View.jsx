import React from "react";

import cx from "classnames";

import Popover from "metabase/components/Popover";

import QueryBuilderTutorial from "metabase/tutorial/QueryBuilderTutorial";

import NativeQueryEditor from "../NativeQueryEditor";
import QueryVisualization from "../QueryVisualization";
import DataReference from "../dataref/DataReference";
import TagEditorSidebar from "../template_tags/TagEditorSidebar";
import SavedQuestionIntroModal from "../SavedQuestionIntroModal";

import AggregationPopover from "../AggregationPopover";
import BreakoutPopover from "../BreakoutPopover";

import DebouncedFrame from "metabase/components/DebouncedFrame";

import QueryModals from "../QueryModals";
import { ViewTitleHeader, ViewSubHeader } from "./ViewHeader";
import NewQuestionHeader from "./NewQuestionHeader";
import ViewFooter from "./ViewFooter";
import ViewSidebar from "./ViewSidebar";

import ChartSettingsSidebar from "./sidebars/ChartSettingsSidebar";
import ChartTypeSidebar from "./sidebars/ChartTypeSidebar";

import FilterSidebar from "./sidebars/FilterSidebar";
// import AggregationSidebar from "./sidebars/AggregationSidebar";
// import BreakoutSidebar from "./sidebars/BreakoutSidebar";
import SummarizeSidebar from "./sidebars/SummarizeSidebar";

import Notebook from "../notebook/Notebook";
import { Motion, spring } from "react-motion";

import NativeQuery from "metabase-lib/lib/queries/NativeQuery";
import StructuredQuery from "metabase-lib/lib/queries/StructuredQuery";

const DEFAULT_POPOVER_STATE = {
  aggregationIndex: null,
  aggregationPopoverTarget: null,
  breakoutIndex: null,
  breakoutPopoverTarget: null,
};

export default class View extends React.Component {
  state = {
    ...DEFAULT_POPOVER_STATE,
  };

  handleAddSeries = e => {
    this.setState({
      ...DEFAULT_POPOVER_STATE,
      aggregationPopoverTarget: e.target,
    });
  };
  handleEditSeries = (e, index) => {
    this.setState({
      ...DEFAULT_POPOVER_STATE,
      aggregationPopoverTarget: e.target,
      aggregationIndex: index,
    });
  };
  handleRemoveSeries = (e, index) => {
    const { query } = this.props;
    query.removeAggregation(index).update(null, { run: true });
  };
  handleEditBreakout = (e, index) => {
    this.setState({
      ...DEFAULT_POPOVER_STATE,
      breakoutPopoverTarget: e.target,
      breakoutIndex: index,
    });
  };
  handleClosePopover = () => {
    this.setState({
      ...DEFAULT_POPOVER_STATE,
    });
  };

  render() {
    const {
      question,
      query,
      card,
      isDirty,
      databases,
      isShowingTemplateTagsEditor,
      isShowingDataReference,
      isShowingTutorial,
      isShowingNewbModal,
      isShowingChartTypeSidebar,
      isShowingChartSettingsSidebar,
      isAddingFilter,
      isEditingFilterIndex,
      isAddingAggregation,
      isEditingAggregationIndex,
      isAddingBreakout,
      isEditingBreakoutIndex,
      queryBuilderMode,
      mode,
    } = this.props;
    const {
      aggregationIndex,
      aggregationPopoverTarget,
      breakoutIndex,
      breakoutPopoverTarget,
    } = this.state;

    // if we don't have a card at all or no databases then we are initializing, so keep it simple
    if (!card || !databases) {
      return <div />;
    }

    const ModeFooter = mode && mode.ModeFooter;
    const isStructured = query instanceof StructuredQuery;

    // only allow editing of series for structured queries
    const onAddSeries = isStructured ? this.handleAddSeries : null;
    const onEditSeries = isStructured ? this.handleEditSeries : null;
    const onRemoveSeries =
      isStructured && query.hasAggregations() ? this.handleRemoveSeries : null;
    const onEditBreakout =
      isStructured && query.hasBreakouts() ? this.handleEditBreakout : null;

    const leftSideBar =
      isStructured && (isEditingFilterIndex != null || isAddingFilter) ? (
        <FilterSidebar
          question={question}
          index={isEditingFilterIndex}
          onClose={this.props.onCloseFilter}
        />
      ) : isStructured &&
        (isEditingAggregationIndex != null || isAddingAggregation) ? (
        <SummarizeSidebar
          question={question}
          initialAggregationIndex={isEditingAggregationIndex}
          onClose={this.props.onCloseAggregation}
        />
      ) : isStructured &&
        (isEditingBreakoutIndex != null || isAddingBreakout) ? (
        <SummarizeSidebar
          question={question}
          initialBreakoutIndex={isEditingBreakoutIndex}
          onClose={this.props.onCloseBreakout}
        />
      ) : isShowingChartSettingsSidebar ? (
        <ChartSettingsSidebar
          {...this.props}
          onClose={this.props.onCloseChartSettings}
        />
      ) : isShowingChartTypeSidebar ? (
        <ChartTypeSidebar
          {...this.props}
          onClose={this.props.onCloseChartType}
        />
      ) : null;

    const rightSideBar =
      isShowingTemplateTagsEditor && query instanceof NativeQuery ? (
        <TagEditorSidebar
          {...this.props}
          onClose={() => this.props.toggleTemplateTagsEditor()}
        />
      ) : isShowingDataReference ? (
        <DataReference
          {...this.props}
          onClose={() => this.props.toggleDataReference()}
        />
      ) : null;

    const newQuestion = query instanceof StructuredQuery && !query.table();

    return (
      <div className={this.props.fitClassNames}>
        <div className={cx("QueryBuilder flex flex-column bg-white spread")}>
          <Motion
            defaultStyle={newQuestion ? { opacity: 0 } : { opacity: 1 }}
            style={
              newQuestion ? { opacity: spring(0) } : { opacity: spring(1) }
            }
          >
            {({ opacity }) => (
              <div className="flex-no-shrink z3 bg-white relative">
                <ViewTitleHeader {...this.props} style={{ opacity }} />
                {opacity < 1 && (
                  <NewQuestionHeader
                    className="spread"
                    style={{ opacity: 1 - opacity }}
                  />
                )}
              </div>
            )}
          </Motion>

          <div className="flex flex-full relative">
            {query instanceof StructuredQuery && (
              <Motion
                defaultStyle={
                  newQuestion
                    ? { opacity: 1, translateY: 0 }
                    : { opacity: 0, translateY: -100 }
                }
                style={
                  queryBuilderMode === "notebook"
                    ? {
                        opacity: spring(1),
                        translateY: spring(0),
                      }
                    : {
                        opacity: spring(0),
                        translateY: spring(-100),
                      }
                }
              >
                {({ opacity, translateY }) =>
                  opacity > 0 ? (
                    // note the `bg-white class here is necessary to obscure the other layer
                    <div
                      className="spread bg-white scroll-y z2 border-top border-bottom"
                      style={{
                        // opacity: opacity,
                        transform: `translateY(${translateY}%)`,
                      }}
                    >
                      <Notebook {...this.props} />
                    </div>
                  ) : null
                }
              </Motion>
            )}

            <ViewSidebar left isOpen={!!leftSideBar}>
              {leftSideBar}
            </ViewSidebar>

            <div className="flex-full flex flex-column">
              {query instanceof NativeQuery && (
                <div className="z2 hide sm-show border-bottom">
                  <NativeQueryEditor
                    {...this.props}
                    isOpen={!card.dataset_query.native.query || isDirty}
                    datasetQuery={card && card.dataset_query}
                  />
                </div>
              )}

              <ViewSubHeader {...this.props} />

              <DebouncedFrame className="flex-full" style={{ flexGrow: 1 }}>
                <QueryVisualization
                  {...this.props}
                  onAddSeries={onAddSeries}
                  onEditSeries={onEditSeries}
                  onRemoveSeries={onRemoveSeries}
                  onEditBreakout={onEditBreakout}
                  noHeader
                  className="spread"
                />
              </DebouncedFrame>

              {ModeFooter && (
                <ModeFooter {...this.props} className="flex-no-shrink" />
              )}

              <ViewFooter {...this.props} className="flex-no-shrink" />
            </div>

            <ViewSidebar right isOpen={!!rightSideBar}>
              {rightSideBar}
            </ViewSidebar>
          </div>
        </div>

        {isShowingTutorial && (
          <QueryBuilderTutorial onClose={() => this.props.closeQbTutorial()} />
        )}

        {isShowingNewbModal && (
          <SavedQuestionIntroModal
            onClose={() => this.props.closeQbNewbModal()}
          />
        )}

        <QueryModals {...this.props} />

        {isStructured && (
          <Popover
            isOpen={!!aggregationPopoverTarget}
            target={aggregationPopoverTarget}
            onClose={this.handleClosePopover}
          >
            <AggregationPopover
              query={query}
              aggregation={
                aggregationIndex >= 0
                  ? query.aggregations()[aggregationIndex]
                  : 0
              }
              onChangeAggregation={aggregation => {
                if (aggregationIndex != null) {
                  query
                    .updateAggregation(aggregationIndex, aggregation)
                    .update(null, { run: true });
                } else {
                  query.addAggregation(aggregation).update(null, { run: true });
                }
                this.handleClosePopover();
              }}
              onClose={this.handleClosePopover}
            />
          </Popover>
        )}
        {isStructured && (
          <Popover
            isOpen={!!breakoutPopoverTarget}
            onClose={this.handleClosePopover}
            target={breakoutPopoverTarget}
          >
            <BreakoutPopover
              query={query}
              breakout={
                breakoutIndex >= 0 ? query.breakouts()[breakoutIndex] : 0
              }
              onChangeBreakout={breakout => {
                if (breakoutIndex != null) {
                  query
                    .updateBreakout(breakoutIndex, breakout)
                    .update(null, { run: true });
                } else {
                  query.addBreakout(breakout).update(null, { run: true });
                }
                this.handleClosePopover();
              }}
              onClose={this.handleClosePopover}
            />
          </Popover>
        )}
      </div>
    );
  }
}